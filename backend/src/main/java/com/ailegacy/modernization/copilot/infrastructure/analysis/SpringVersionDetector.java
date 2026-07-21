package com.ailegacy.modernization.copilot.infrastructure.analysis;

import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.infrastructure.analysis.model.ScannedFile;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Determines the Spring Framework version from an explicit property or
 * dependency declaration, falling back to noting that it's managed
 * transitively by Spring Boot's dependency management when that's detected
 * instead.
 */
@Component
public class SpringVersionDetector {

    private static final Pattern POM_PROPERTY = Pattern.compile("<spring\\.version>\\s*([\\d.]+[\\w.\\-]*)\\s*</spring\\.version>");
    private static final String[] SPRING_CORE_ARTIFACT_IDS = {"spring-core", "spring-context", "spring-beans", "spring-webmvc"};

    public DetectedAttribute detect(List<ScannedFile> files, DetectedAttribute springBootVersion) {
        for (ScannedFile file : files) {
            if (!"pom.xml".equalsIgnoreCase(file.fileName())) {
                continue;
            }

            Matcher property = POM_PROPERTY.matcher(file.content());
            if (property.find()) {
                return found(property.group(1), "pom.xml declares <spring.version>" + property.group(1) + "</spring.version>");
            }

            for (String artifactId : SPRING_CORE_ARTIFACT_IDS) {
                Optional<String> version = BuildFileVersionFinder.findMavenDependencyVersion(file.content(), artifactId, 300);
                if (version.isPresent()) {
                    return found(version.get(), "pom.xml declares " + artifactId + " version " + version.get());
                }
            }
        }

        for (ScannedFile file : files) {
            if (!isGradleBuildFile(file)) {
                continue;
            }
            Optional<String> version = BuildFileVersionFinder.findGradleDependencyVersion(file.content(), SPRING_CORE_ARTIFACT_IDS);
            if (version.isPresent()) {
                return found(version.get(), file.fileName() + " declares a Spring Framework dependency at version " + version.get());
            }
        }

        if (!DetectedAttribute.UNKNOWN_VALUE.equals(springBootVersion.getValue())
                && !"Not applicable".equals(springBootVersion.getValue())) {
            return DetectedAttribute.builder()
                    .value("Managed by Spring Boot " + springBootVersion.getValue())
                    .confidenceScore(60)
                    .evidence(List.of(
                            "No explicit Spring Framework version declared",
                            "Version is implicitly managed by the detected Spring Boot " + springBootVersion.getValue() + " parent's dependency management"
                    ))
                    .build();
        }

        return DetectedAttribute.builder()
                .value(DetectedAttribute.UNKNOWN_VALUE)
                .confidenceScore(0)
                .evidence(List.of("No explicit Spring Framework version or Spring Boot parent found"))
                .build();
    }

    private DetectedAttribute found(String version, String evidence) {
        return DetectedAttribute.builder()
                .value(version)
                .confidenceScore(90)
                .evidence(List.of(evidence))
                .build();
    }

    private boolean isGradleBuildFile(ScannedFile file) {
        String name = file.fileName().toLowerCase();
        return name.equals("build.gradle") || name.equals("build.gradle.kts");
    }

}
