package com.ailegacy.modernization.copilot.infrastructure.analysis;

import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.infrastructure.analysis.model.ScannedFile;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Determines the Servlet specification version, preferring web.xml's own
 * declared version attribute, then an explicit servlet-api dependency
 * version, then inferring a broad range from the javax vs. jakarta package
 * split (Jakarta EE 9 renamed javax.servlet to jakarta.servlet).
 */
@Component
public class ServletVersionDetector {

    private static final Pattern WEB_XML_VERSION = Pattern.compile("<web-app\\b[^>]*\\bversion\\s*=\\s*\"([\\d.]+)\"");
    private static final String[] SERVLET_API_ARTIFACT_IDS = {"servlet-api"};

    public DetectedAttribute detect(List<ScannedFile> files) {
        for (ScannedFile file : files) {
            if (!"web.xml".equalsIgnoreCase(file.fileName())) {
                continue;
            }
            Matcher matcher = WEB_XML_VERSION.matcher(file.content());
            if (matcher.find()) {
                String version = matcher.group(1);
                return DetectedAttribute.builder()
                        .value(version)
                        .confidenceScore(95)
                        .evidence(List.of("web.xml declares <web-app version=\"" + version + "\">"))
                        .build();
            }
        }

        for (ScannedFile file : files) {
            if ("pom.xml".equalsIgnoreCase(file.fileName())) {
                Optional<String> version = BuildFileVersionFinder.findMavenDependencyVersion(file.content(), "servlet-api", 300)
                        .or(() -> BuildFileVersionFinder.findMavenDependencyVersion(file.content(), "jakarta.servlet-api", 300));
                if (version.isPresent()) {
                    return DetectedAttribute.builder()
                            .value(version.get())
                            .confidenceScore(85)
                            .evidence(List.of("pom.xml declares a servlet-api dependency at version " + version.get()))
                            .build();
                }
            } else if (isGradleBuildFile(file)) {
                Optional<String> version = BuildFileVersionFinder.findGradleDependencyVersion(file.content(), SERVLET_API_ARTIFACT_IDS);
                if (version.isPresent()) {
                    return DetectedAttribute.builder()
                            .value(version.get())
                            .confidenceScore(85)
                            .evidence(List.of(file.fileName() + " declares a servlet-api dependency at version " + version.get()))
                            .build();
                }
            }
        }

        boolean usesJakarta = anyFileContains(files, "jakarta.servlet");
        boolean usesJavax = anyFileContains(files, "javax.servlet");
        if (usesJakarta) {
            return DetectedAttribute.builder()
                    .value("5.0+")
                    .confidenceScore(55)
                    .evidence(List.of("jakarta.servlet package usage found (Jakarta EE 9+ renamed javax.servlet to jakarta.servlet, starting at Servlet 5.0)"))
                    .build();
        }
        if (usesJavax) {
            return DetectedAttribute.builder()
                    .value("2.5-4.0")
                    .confidenceScore(40)
                    .evidence(List.of("javax.servlet package usage found, but no exact version indicator; javax.servlet spans Servlet 2.5 through 4.0"))
                    .build();
        }

        return DetectedAttribute.builder()
                .value("Not applicable")
                .confidenceScore(100)
                .evidence(List.of("No Servlet API usage found in the uploaded project"))
                .build();
    }

    private boolean isGradleBuildFile(ScannedFile file) {
        String name = file.fileName().toLowerCase();
        return name.equals("build.gradle") || name.equals("build.gradle.kts");
    }

    private boolean anyFileContains(List<ScannedFile> files, String needle) {
        return files.stream().anyMatch(f -> f.content().contains(needle));
    }

}
