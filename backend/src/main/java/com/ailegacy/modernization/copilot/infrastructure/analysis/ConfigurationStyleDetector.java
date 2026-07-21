package com.ailegacy.modernization.copilot.infrastructure.analysis;

import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.infrastructure.analysis.model.ScannedFile;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Determines which Spring configuration style(s) a project uses. A project
 * can legitimately use more than one at once (e.g. a partially-migrated
 * legacy app mixing XML beans with newer annotation-driven components), so
 * every style with evidence is reported rather than picking just one.
 */
@Component
public class ConfigurationStyleDetector {

    public List<DetectedAttribute> detect(List<ScannedFile> files) {
        List<DetectedAttribute> styles = new ArrayList<>();

        long xmlBeanFiles = files.stream()
                .filter(f -> "xml".equalsIgnoreCase(f.extension()))
                .filter(f -> f.content().contains("springframework.org/schema/beans") || f.content().contains("<beans"))
                .count();
        if (xmlBeanFiles > 0) {
            styles.add(DetectedAttribute.builder()
                    .value("XML")
                    .confidenceScore((int) Math.min(100, 60 + xmlBeanFiles * 15))
                    .evidence(List.of(xmlBeanFiles + " Spring beans XML file(s) found (<beans> root element or beans schema namespace)"))
                    .build());
        }

        long javaConfigFiles = files.stream()
                .filter(f -> "java".equalsIgnoreCase(f.extension()))
                .filter(f -> f.content().contains("@Configuration") && f.content().contains("@Bean"))
                .count();
        if (javaConfigFiles > 0) {
            styles.add(DetectedAttribute.builder()
                    .value("Java Config")
                    .confidenceScore((int) Math.min(100, 60 + javaConfigFiles * 15))
                    .evidence(List.of(javaConfigFiles + " class(es) combining @Configuration and @Bean found"))
                    .build());
        }

        long annotationFiles = files.stream()
                .filter(f -> "java".equalsIgnoreCase(f.extension()))
                .filter(f -> containsAny(f.content(), "@Component", "@Service", "@Repository", "@Autowired", "@Controller", "@RestController"))
                .count();
        if (annotationFiles > 0) {
            styles.add(DetectedAttribute.builder()
                    .value("Annotations")
                    .confidenceScore((int) Math.min(100, 50 + annotationFiles * 10))
                    .evidence(List.of(annotationFiles + " class(es) using Spring stereotype/wiring annotations found"))
                    .build());
        }

        return styles;
    }

    private boolean containsAny(String content, String... needles) {
        for (String needle : needles) {
            if (content.contains(needle)) {
                return true;
            }
        }
        return false;
    }

}
