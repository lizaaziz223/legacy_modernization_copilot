package com.ailegacy.modernization.copilot.infrastructure.analysis;

import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.infrastructure.analysis.model.ScannedFile;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Determines the Gradle version a project builds with, from its wrapper
 * (the exact version actually used) or, failing that, an explicit
 * {@code wrapper { gradleVersion = ... }} block in the build script.
 */
@Component
public class GradleVersionDetector {

    private static final Pattern WRAPPER_DISTRIBUTION_URL = Pattern.compile(
            "gradle-([\\d.]+)-(?:bin|all)"
    );
    private static final Pattern WRAPPER_BLOCK_VERSION = Pattern.compile(
            "gradleVersion\\s*=\\s*['\"]([\\d.]+)['\"]"
    );

    public DetectedAttribute detect(List<ScannedFile> files) {
        boolean hasGradleBuildFile = files.stream().anyMatch(f -> isGradleBuildFile(f) || isGradleWrapperProperties(f));

        for (ScannedFile file : files) {
            if (!isGradleWrapperProperties(file)) {
                continue;
            }
            Matcher matcher = WRAPPER_DISTRIBUTION_URL.matcher(file.content());
            if (matcher.find()) {
                String version = matcher.group(1);
                return DetectedAttribute.builder()
                        .value(version)
                        .confidenceScore(95)
                        .evidence(List.of("gradle-wrapper.properties pins the exact Gradle distribution to " + version))
                        .build();
            }
        }

        for (ScannedFile file : files) {
            if (!isGradleBuildFile(file)) {
                continue;
            }
            Matcher matcher = WRAPPER_BLOCK_VERSION.matcher(file.content());
            if (matcher.find()) {
                String version = matcher.group(1);
                return DetectedAttribute.builder()
                        .value(version)
                        .confidenceScore(85)
                        .evidence(List.of(file.fileName() + " declares wrapper { gradleVersion = '" + version + "' }"))
                        .build();
            }
        }

        if (!hasGradleBuildFile) {
            return DetectedAttribute.builder()
                    .value("Not applicable")
                    .confidenceScore(100)
                    .evidence(List.of("No build.gradle, build.gradle.kts, or Gradle wrapper found in the uploaded project"))
                    .build();
        }

        return DetectedAttribute.builder()
                .value(DetectedAttribute.UNKNOWN_VALUE)
                .confidenceScore(0)
                .evidence(List.of("Gradle build file found but no wrapper or explicit gradleVersion declared"))
                .build();
    }

    private boolean isGradleBuildFile(ScannedFile file) {
        String name = file.fileName().toLowerCase();
        return name.equals("build.gradle") || name.equals("build.gradle.kts");
    }

    private boolean isGradleWrapperProperties(ScannedFile file) {
        return "gradle-wrapper.properties".equalsIgnoreCase(file.fileName());
    }

}
