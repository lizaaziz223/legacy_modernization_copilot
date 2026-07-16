package com.ailegacy.modernization.copilot.infrastructure.analysis;

import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.infrastructure.analysis.model.ScannedFile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Determines the project's Java (language level) version, trying progressively
 * weaker evidence until something is found - a build descriptor's explicit
 * declaration is authoritative, a compiled .class file's bytecode major version
 * is a hard fact, and language syntax/import usage are only heuristics. Only
 * reports Unknown when the project has no Java source, bytecode, or build
 * descriptor to infer anything from at all.
 */
@Component
@RequiredArgsConstructor
public class JavaVersionDetector {

    private static final Pattern POM_VERSION_PATTERN = Pattern.compile(
            "<(?:maven\\.compiler\\.release|maven\\.compiler\\.source|maven\\.compiler\\.target|java\\.version)>\\s*(1\\.\\d|\\d{1,2})\\s*</"
    );
    private static final Pattern GRADLE_SOURCE_COMPATIBILITY = Pattern.compile(
            "sourceCompatibility\\s*=?\\s*['\"]?(?:JavaVersion\\.VERSION_)?(1_\\d|\\d{1,2})['\"]?"
    );
    private static final Pattern GRADLE_TOOLCHAIN = Pattern.compile("JavaLanguageVersion\\.of\\((\\d{1,2})\\)");
    private static final Pattern MANIFEST_BUILD_JDK = Pattern.compile(
            "(?:Build-Jdk-Spec|Build-Jdk|Created-By)\\s*:\\s*(1\\.\\d|\\d{1,2})"
    );

    private final ClassFileVersionReader classFileVersionReader;

    public DetectedAttribute detect(List<ScannedFile> files, String storagePath) {
        Optional<DetectedAttribute> fromPom = fromPom(files);
        if (fromPom.isPresent()) return fromPom.get();

        Optional<DetectedAttribute> fromGradle = fromGradle(files);
        if (fromGradle.isPresent()) return fromGradle.get();

        Optional<DetectedAttribute> fromManifest = fromManifest(files);
        if (fromManifest.isPresent()) return fromManifest.get();

        Optional<DetectedAttribute> fromBytecode = fromBytecode(storagePath);
        if (fromBytecode.isPresent()) return fromBytecode.get();

        Optional<DetectedAttribute> fromSyntax = fromSyntaxHeuristics(files);
        if (fromSyntax.isPresent()) return fromSyntax.get();

        Optional<DetectedAttribute> fromImports = fromImportHeuristics(files);
        if (fromImports.isPresent()) return fromImports.get();

        boolean hasJavaFiles = files.stream().anyMatch(f -> "java".equalsIgnoreCase(f.extension()));
        if (hasJavaFiles) {
            return DetectedAttribute.builder()
                    .value("8")
                    .confidenceScore(25)
                    .evidence(List.of(
                            "No explicit version indicator found in any build descriptor, manifest, bytecode, or syntax",
                            "Defaulted to Java 8, the common baseline for legacy servlet-era projects"
                    ))
                    .build();
        }

        return DetectedAttribute.unknown();
    }

    private Optional<DetectedAttribute> fromPom(List<ScannedFile> files) {
        for (ScannedFile file : files) {
            if (!"pom.xml".equalsIgnoreCase(file.fileName())) {
                continue;
            }
            Matcher matcher = POM_VERSION_PATTERN.matcher(file.content());
            if (matcher.find()) {
                String version = normalize(matcher.group(1));
                return Optional.of(DetectedAttribute.builder()
                        .value(version)
                        .confidenceScore(95)
                        .evidence(List.of("pom.xml declares Java " + version + " via maven.compiler.* or java.version"))
                        .build());
            }
        }
        return Optional.empty();
    }

    private Optional<DetectedAttribute> fromGradle(List<ScannedFile> files) {
        for (ScannedFile file : files) {
            if (!isGradleBuildFile(file)) {
                continue;
            }
            Matcher toolchain = GRADLE_TOOLCHAIN.matcher(file.content());
            if (toolchain.find()) {
                String version = toolchain.group(1);
                return Optional.of(DetectedAttribute.builder()
                        .value(version)
                        .confidenceScore(92)
                        .evidence(List.of(file.fileName() + " declares a Java toolchain of version " + version))
                        .build());
            }
            Matcher sourceCompat = GRADLE_SOURCE_COMPATIBILITY.matcher(file.content());
            if (sourceCompat.find()) {
                String version = normalize(sourceCompat.group(1).replace('_', '.'));
                return Optional.of(DetectedAttribute.builder()
                        .value(version)
                        .confidenceScore(90)
                        .evidence(List.of(file.fileName() + " declares sourceCompatibility " + version))
                        .build());
            }
        }
        return Optional.empty();
    }

    private Optional<DetectedAttribute> fromManifest(List<ScannedFile> files) {
        for (ScannedFile file : files) {
            if (!isManifestFile(file)) {
                continue;
            }
            Matcher matcher = MANIFEST_BUILD_JDK.matcher(file.content());
            if (matcher.find()) {
                String version = normalize(matcher.group(1));
                return Optional.of(DetectedAttribute.builder()
                        .value(version)
                        .confidenceScore(80)
                        .evidence(List.of("MANIFEST.MF records a build JDK of version " + version))
                        .build());
            }
        }
        return Optional.empty();
    }

    private Optional<DetectedAttribute> fromBytecode(String storagePath) {
        if (storagePath == null) {
            return Optional.empty();
        }
        return classFileVersionReader.detect(storagePath)
                .map(classFileVersion -> DetectedAttribute.builder()
                        .value(classFileVersion.javaRelease())
                        .confidenceScore(85)
                        .evidence(List.of(
                                "Compiled class file " + classFileVersion.fileName() + " has bytecode major version "
                                        + classFileVersion.majorVersion() + " (Java " + classFileVersion.javaRelease() + ")"
                        ))
                        .build());
    }

    private Optional<DetectedAttribute> fromSyntaxHeuristics(List<ScannedFile> files) {
        if (anyJavaFileContains(files, "sealed ") && anyJavaFileContains(files, "permits ")) {
            return Optional.of(syntaxResult("17+", "sealed classes with a permits clause"));
        }
        if (anyJavaFileContains(files, "\"\"\"")) {
            return Optional.of(syntaxResult("15+", "text block syntax (\"\"\")"));
        }
        if (anyJavaFileMatches(files, "\\brecord\\s+\\w+\\s*\\(")) {
            return Optional.of(syntaxResult("16+", "record type declarations"));
        }
        if (anyJavaFileMatches(files, "\\bvar\\s+\\w+\\s*=")) {
            return Optional.of(syntaxResult("10+", "local variable type inference (var)"));
        }
        return Optional.empty();
    }

    private Optional<DetectedAttribute> fromImportHeuristics(List<ScannedFile> files) {
        if (anyJavaFileContains(files, "import java.util.stream.")) {
            return Optional.of(DetectedAttribute.builder()
                    .value("8+")
                    .confidenceScore(35)
                    .evidence(List.of("java.util.stream.* imports (introduced in Java 8) found in source"))
                    .build());
        }
        if (anyJavaFileContains(files, "import jakarta.")) {
            return Optional.of(DetectedAttribute.builder()
                    .value("11+")
                    .confidenceScore(30)
                    .evidence(List.of("jakarta.* imports (Jakarta EE 9+, typically run on Java 11+) found in source"))
                    .build());
        }
        return Optional.empty();
    }

    private DetectedAttribute syntaxResult(String version, String syntaxDescription) {
        return DetectedAttribute.builder()
                .value(version)
                .confidenceScore(60)
                .evidence(List.of("Language syntax heuristic: " + syntaxDescription + " implies Java " + version))
                .build();
    }

    private boolean isGradleBuildFile(ScannedFile file) {
        String name = file.fileName().toLowerCase();
        return name.equals("build.gradle") || name.equals("build.gradle.kts");
    }

    private boolean isManifestFile(ScannedFile file) {
        return "MANIFEST.MF".equalsIgnoreCase(file.fileName());
    }

    private boolean anyJavaFileContains(List<ScannedFile> files, String needle) {
        return files.stream()
                .filter(f -> "java".equalsIgnoreCase(f.extension()))
                .anyMatch(f -> f.content().contains(needle));
    }

    private boolean anyJavaFileMatches(List<ScannedFile> files, String regex) {
        Pattern pattern = Pattern.compile(regex);
        return files.stream()
                .filter(f -> "java".equalsIgnoreCase(f.extension()))
                .anyMatch(f -> pattern.matcher(f.content()).find());
    }

    private String normalize(String rawVersion) {
        return rawVersion.startsWith("1.") ? rawVersion.substring(2) : rawVersion;
    }

}
