package com.ailegacy.modernization.copilot.infrastructure.analysis;

import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.infrastructure.analysis.model.ScannedFile;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Determines the packaging format (WAR/EAR/JAR), preferring an explicit
 * Maven {@code <packaging>} declaration and otherwise inferring it from
 * deployment descriptor conventions.
 */
@Component
public class PackagingDetector {

    private static final Pattern POM_PACKAGING = Pattern.compile("<packaging>\\s*(\\w+)\\s*</packaging>");

    public DetectedAttribute detect(List<ScannedFile> files) {
        for (ScannedFile file : files) {
            if (!"pom.xml".equalsIgnoreCase(file.fileName())) {
                continue;
            }
            Matcher matcher = POM_PACKAGING.matcher(file.content());
            if (matcher.find()) {
                String packaging = matcher.group(1).toUpperCase();
                return DetectedAttribute.builder()
                        .value(packaging)
                        .confidenceScore(95)
                        .evidence(List.of("pom.xml declares <packaging>" + matcher.group(1) + "</packaging>"))
                        .build();
            }
        }

        boolean hasApplicationXml = files.stream().anyMatch(f -> "application.xml".equalsIgnoreCase(f.fileName())
                && f.relativePath().contains("META-INF"));
        if (hasApplicationXml) {
            return DetectedAttribute.builder()
                    .value("EAR")
                    .confidenceScore(75)
                    .evidence(List.of("META-INF/application.xml (Java EE application descriptor) found"))
                    .build();
        }

        boolean hasWebXml = files.stream().anyMatch(f -> "web.xml".equalsIgnoreCase(f.fileName()));
        if (hasWebXml) {
            return DetectedAttribute.builder()
                    .value("WAR")
                    .confidenceScore(70)
                    .evidence(List.of("web.xml (servlet deployment descriptor) found, implying a WAR deployment"))
                    .build();
        }

        return DetectedAttribute.builder()
                .value("JAR")
                .confidenceScore(50)
                .evidence(List.of("No packaging descriptor, EAR, or WAR markers found; defaulting to a plain JAR"))
                .build();
    }

}
