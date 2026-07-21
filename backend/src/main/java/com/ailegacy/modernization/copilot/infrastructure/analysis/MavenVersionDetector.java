package com.ailegacy.modernization.copilot.infrastructure.analysis;

import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.infrastructure.analysis.model.ScannedFile;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Determines the Maven version a project builds with, from its wrapper
 * (the exact version actually used) or, failing that, the minimum version
 * declared in {@code pom.xml}.
 */
@Component
public class MavenVersionDetector {

    private static final Pattern WRAPPER_DISTRIBUTION_URL = Pattern.compile(
            "apache-maven-([\\d.]+)-(?:bin|src)"
    );
    private static final Pattern POM_PREREQUISITE = Pattern.compile(
            "<prerequisites>\\s*<maven>\\s*([\\d.]+)\\s*</maven>"
    );

    public DetectedAttribute detect(List<ScannedFile> files) {
        boolean hasPom = files.stream().anyMatch(f -> "pom.xml".equalsIgnoreCase(f.fileName()));

        for (ScannedFile file : files) {
            if (!"maven-wrapper.properties".equalsIgnoreCase(file.fileName())) {
                continue;
            }
            Matcher matcher = WRAPPER_DISTRIBUTION_URL.matcher(file.content());
            if (matcher.find()) {
                String version = matcher.group(1);
                return DetectedAttribute.builder()
                        .value(version)
                        .confidenceScore(95)
                        .evidence(List.of("maven-wrapper.properties pins the exact Maven distribution to " + version))
                        .build();
            }
        }

        for (ScannedFile file : files) {
            if (!"pom.xml".equalsIgnoreCase(file.fileName())) {
                continue;
            }
            Matcher matcher = POM_PREREQUISITE.matcher(file.content());
            if (matcher.find()) {
                String version = matcher.group(1);
                return DetectedAttribute.builder()
                        .value(version + "+ (minimum required)")
                        .confidenceScore(70)
                        .evidence(List.of("pom.xml declares <prerequisites><maven>" + version + "</maven></prerequisites>"))
                        .build();
            }
        }

        if (!hasPom) {
            return notApplicable();
        }

        return DetectedAttribute.builder()
                .value(DetectedAttribute.UNKNOWN_VALUE)
                .confidenceScore(0)
                .evidence(List.of("pom.xml found but no Maven wrapper or explicit minimum version declared"))
                .build();
    }

    private DetectedAttribute notApplicable() {
        return DetectedAttribute.builder()
                .value("Not applicable")
                .confidenceScore(100)
                .evidence(List.of("No pom.xml found in the uploaded project"))
                .build();
    }

}
