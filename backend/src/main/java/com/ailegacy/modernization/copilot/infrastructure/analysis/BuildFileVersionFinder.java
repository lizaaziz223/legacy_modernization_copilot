package com.ailegacy.modernization.copilot.infrastructure.analysis;

import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Shared regex helpers for pulling a dependency's version out of a Maven
 * {@code pom.xml} or a Gradle {@code build.gradle}/{@code build.gradle.kts}
 * file, reused by every version detector that needs to look one up.
 */
final class BuildFileVersionFinder {

    private static final Pattern VERSION_TAG = Pattern.compile("<version>\\s*([\\w.\\-]+)\\s*</version>");

    private BuildFileVersionFinder() {
    }

    /**
     * Finds the {@code <version>} tag that follows an {@code <artifactId>artifactId</artifactId>}
     * declaration within {@code maxLookahead} characters, matching the common (though not
     * universally guaranteed) Maven convention of groupId/artifactId/version appearing in that
     * order within a {@code <dependency>} or {@code <parent>} block.
     */
    static Optional<String> findMavenDependencyVersion(String pomContent, String artifactId, int maxLookahead) {
        Pattern artifactPattern = Pattern.compile("<artifactId>\\s*" + Pattern.quote(artifactId) + "\\s*</artifactId>");
        Matcher artifactMatcher = artifactPattern.matcher(pomContent);
        if (!artifactMatcher.find()) {
            return Optional.empty();
        }

        int windowEnd = Math.min(pomContent.length(), artifactMatcher.end() + maxLookahead);
        String window = pomContent.substring(artifactMatcher.end(), windowEnd);
        Matcher versionMatcher = VERSION_TAG.matcher(window);
        if (versionMatcher.find()) {
            return Optional.of(versionMatcher.group(1));
        }
        return Optional.empty();
    }

    /**
     * Finds a Gradle short-form dependency declaration ({@code group:artifact:version}, with
     * either quoting style) for any artifact name containing one of the given substrings.
     */
    static Optional<String> findGradleDependencyVersion(String gradleContent, String... artifactSubstrings) {
        for (String artifact : artifactSubstrings) {
            Pattern pattern = Pattern.compile(
                    "['\"]([\\w.\\-]+:[\\w.\\-]*" + Pattern.quote(artifact) + "[\\w.\\-]*:[\\w.\\-]+)['\"]"
            );
            Matcher matcher = pattern.matcher(gradleContent);
            if (matcher.find()) {
                String[] parts = matcher.group(1).split(":");
                if (parts.length >= 3) {
                    return Optional.of(parts[2]);
                }
            }
        }
        return Optional.empty();
    }

}
