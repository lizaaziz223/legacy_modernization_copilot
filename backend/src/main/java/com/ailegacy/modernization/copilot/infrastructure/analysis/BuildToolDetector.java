package com.ailegacy.modernization.copilot.infrastructure.analysis;

import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.infrastructure.analysis.model.ScannedFile;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Detects the build tool from its descriptor file.
 */
@Component
public class BuildToolDetector {

    public DetectedAttribute detect(List<ScannedFile> files) {
        boolean hasPom = files.stream().anyMatch(f -> "pom.xml".equalsIgnoreCase(f.fileName()));
        if (hasPom) {
            return DetectedAttribute.builder()
                    .value("Maven")
                    .confidenceScore(95)
                    .evidence(List.of("pom.xml found"))
                    .build();
        }

        boolean hasGradleBuild = files.stream().anyMatch(this::isGradleBuildFile);
        boolean hasGradleWrapper = files.stream().anyMatch(f -> "gradle-wrapper.properties".equalsIgnoreCase(f.fileName()));
        if (hasGradleBuild || hasGradleWrapper) {
            return DetectedAttribute.builder()
                    .value("Gradle")
                    .confidenceScore(90)
                    .evidence(List.of(hasGradleBuild ? "build.gradle / build.gradle.kts found" : "gradle-wrapper.properties found"))
                    .build();
        }

        boolean hasAntBuild = files.stream().anyMatch(f -> "build.xml".equalsIgnoreCase(f.fileName()));
        if (hasAntBuild) {
            return DetectedAttribute.builder()
                    .value("Ant")
                    .confidenceScore(85)
                    .evidence(List.of("build.xml found"))
                    .build();
        }

        return DetectedAttribute.unknown();
    }

    private boolean isGradleBuildFile(ScannedFile file) {
        String name = file.fileName().toLowerCase();
        return name.equals("build.gradle") || name.equals("build.gradle.kts");
    }

}
