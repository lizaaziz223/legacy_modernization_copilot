package com.ailegacy.modernization.copilot.infrastructure.analysis;

import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.infrastructure.analysis.model.ScannedFile;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Determines the Hibernate ORM version from an explicit dependency
 * declaration.
 */
@Component
public class HibernateVersionDetector {

    private static final String[] HIBERNATE_ARTIFACT_IDS = {"hibernate-core"};

    public DetectedAttribute detect(List<ScannedFile> files) {
        boolean usesHibernate = files.stream().anyMatch(f -> f.content().contains("org.hibernate"));

        for (ScannedFile file : files) {
            if ("pom.xml".equalsIgnoreCase(file.fileName())) {
                Optional<String> version = BuildFileVersionFinder.findMavenDependencyVersion(file.content(), "hibernate-core", 300);
                if (version.isPresent()) {
                    return DetectedAttribute.builder()
                            .value(version.get())
                            .confidenceScore(90)
                            .evidence(List.of("pom.xml declares hibernate-core version " + version.get()))
                            .build();
                }
            } else if (isGradleBuildFile(file)) {
                Optional<String> version = BuildFileVersionFinder.findGradleDependencyVersion(file.content(), HIBERNATE_ARTIFACT_IDS);
                if (version.isPresent()) {
                    return DetectedAttribute.builder()
                            .value(version.get())
                            .confidenceScore(90)
                            .evidence(List.of(file.fileName() + " declares hibernate-core version " + version.get()))
                            .build();
                }
            }
        }

        if (!usesHibernate) {
            return DetectedAttribute.builder()
                    .value("Not applicable")
                    .confidenceScore(100)
                    .evidence(List.of("No org.hibernate usage found in the uploaded project"))
                    .build();
        }

        return DetectedAttribute.builder()
                .value(DetectedAttribute.UNKNOWN_VALUE)
                .confidenceScore(15)
                .evidence(List.of("org.hibernate usage found, but no explicit hibernate-core dependency version declared"))
                .build();
    }

    private boolean isGradleBuildFile(ScannedFile file) {
        String name = file.fileName().toLowerCase();
        return name.equals("build.gradle") || name.equals("build.gradle.kts");
    }

}
