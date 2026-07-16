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
 * Determines the specific JDK build used to compile the project - distinct
 * from the Java language level, since a project targeting Java 11 source
 * compatibility might have actually been built with a newer JDK. Falls back
 * to the detected Java version when no build-JDK metadata is available.
 */
@Component
@RequiredArgsConstructor
public class JdkVersionDetector {

    private static final Pattern MANIFEST_JDK = Pattern.compile(
            "(?:Build-Jdk-Spec|Build-Jdk|Created-By)\\s*:\\s*([\\w.\\-+() ]+)"
    );

    private final ClassFileVersionReader classFileVersionReader;

    public DetectedAttribute detect(List<ScannedFile> files, String storagePath, DetectedAttribute javaVersion) {
        Optional<DetectedAttribute> fromManifest = fromManifest(files);
        if (fromManifest.isPresent()) return fromManifest.get();

        Optional<DetectedAttribute> fromBytecode = fromBytecode(storagePath);
        if (fromBytecode.isPresent()) return fromBytecode.get();

        if (!DetectedAttribute.UNKNOWN_VALUE.equals(javaVersion.getValue())) {
            return DetectedAttribute.builder()
                    .value(javaVersion.getValue())
                    .confidenceScore(Math.max(0, javaVersion.getConfidenceScore() - 20))
                    .evidence(List.of(
                            "No explicit JDK build metadata (MANIFEST.MF or bytecode) found",
                            "Assumed to match the detected Java language version (" + javaVersion.getValue() + ")"
                    ))
                    .build();
        }

        return DetectedAttribute.unknown();
    }

    private Optional<DetectedAttribute> fromManifest(List<ScannedFile> files) {
        for (ScannedFile file : files) {
            if (!"MANIFEST.MF".equalsIgnoreCase(file.fileName())) {
                continue;
            }
            Matcher matcher = MANIFEST_JDK.matcher(file.content());
            if (matcher.find()) {
                String jdk = matcher.group(1).trim();
                return Optional.of(DetectedAttribute.builder()
                        .value(jdk)
                        .confidenceScore(90)
                        .evidence(List.of("MANIFEST.MF build metadata records JDK " + jdk))
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
                        .value("JDK " + classFileVersion.javaRelease())
                        .confidenceScore(80)
                        .evidence(List.of(
                                "Compiled class file " + classFileVersion.fileName() + " (bytecode major version "
                                        + classFileVersion.majorVersion() + ") corresponds to JDK " + classFileVersion.javaRelease()
                        ))
                        .build());
    }

}
