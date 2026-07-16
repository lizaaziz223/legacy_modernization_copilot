package com.ailegacy.modernization.copilot.infrastructure.analysis;

import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.infrastructure.analysis.model.ScannedFile;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Determines the Spring Boot version from the Maven parent POM, a Maven
 * property, or the Gradle plugin declaration.
 */
@Component
public class SpringBootVersionDetector {

    private static final Pattern GRADLE_PLUGIN_VERSION = Pattern.compile(
            "id\\s*\\(?['\"]org\\.springframework\\.boot['\"]\\)?\\s*version\\s*['\"]([\\d.]+[\\w.\\-]*)['\"]"
    );
    private static final Pattern POM_PROPERTY = Pattern.compile(
            "<spring-boot\\.version>\\s*([\\d.]+[\\w.\\-]*)\\s*</spring-boot\\.version>"
    );

    public DetectedAttribute detect(List<ScannedFile> files) {
        for (ScannedFile file : files) {
            if (!"pom.xml".equalsIgnoreCase(file.fileName())) {
                continue;
            }

            Optional<String> parentVersion = BuildFileVersionFinder.findMavenDependencyVersion(
                    file.content(), "spring-boot-starter-parent", 500
            );
            if (parentVersion.isPresent()) {
                return found(parentVersion.get(), "pom.xml's parent POM is spring-boot-starter-parent version " + parentVersion.get());
            }

            Matcher property = POM_PROPERTY.matcher(file.content());
            if (property.find()) {
                return found(property.group(1), "pom.xml declares <spring-boot.version>" + property.group(1) + "</spring-boot.version>");
            }
        }

        for (ScannedFile file : files) {
            if (!isGradleBuildFile(file)) {
                continue;
            }
            Matcher plugin = GRADLE_PLUGIN_VERSION.matcher(file.content());
            if (plugin.find()) {
                return found(plugin.group(1), file.fileName() + " applies the org.springframework.boot plugin version " + plugin.group(1));
            }
        }

        return DetectedAttribute.builder()
                .value(DetectedAttribute.UNKNOWN_VALUE)
                .confidenceScore(0)
                .evidence(List.of("No Spring Boot parent POM, version property, or Gradle plugin declaration found"))
                .build();
    }

    private DetectedAttribute found(String version, String evidence) {
        return DetectedAttribute.builder()
                .value(version)
                .confidenceScore(95)
                .evidence(List.of(evidence))
                .build();
    }

    private boolean isGradleBuildFile(ScannedFile file) {
        String name = file.fileName().toLowerCase();
        return name.equals("build.gradle") || name.equals("build.gradle.kts");
    }

}
