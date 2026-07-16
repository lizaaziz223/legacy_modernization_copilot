package com.ailegacy.modernization.copilot.infrastructure.analysis;

import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.domain.entities.DetectedTechnology;
import com.ailegacy.modernization.copilot.domain.entities.TechnologyDetectionResult;
import com.ailegacy.modernization.copilot.infrastructure.analysis.model.ScannedFile;
import com.ailegacy.modernization.copilot.infrastructure.analysis.model.TechnologyRule;
import com.ailegacy.modernization.copilot.infrastructure.analysis.model.TechnologySignal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Technology detection agent: scans an extracted project's files and reports
 * which legacy technologies it uses, plus every build/runtime/framework
 * version it can infer, each with a confidence score and supporting evidence.
 *
 * This is a single, self-contained pipeline stage - it does not trigger or feed
 * into architecture analysis.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TechnologyDetectionEngine {

    private static final int MAX_EVIDENCE_SAMPLES = 5;

    private final ProjectFileScanner fileScanner;
    private final TechnologyRuleCatalog ruleCatalog;
    private final JavaVersionDetector javaVersionDetector;
    private final JdkVersionDetector jdkVersionDetector;
    private final DatabaseDetector databaseDetector;
    private final BuildToolDetector buildToolDetector;
    private final ApplicationServerDetector applicationServerDetector;
    private final MavenVersionDetector mavenVersionDetector;
    private final GradleVersionDetector gradleVersionDetector;
    private final SpringVersionDetector springVersionDetector;
    private final SpringBootVersionDetector springBootVersionDetector;
    private final ServletVersionDetector servletVersionDetector;
    private final JspVersionDetector jspVersionDetector;
    private final HibernateVersionDetector hibernateVersionDetector;
    private final PackagingDetector packagingDetector;
    private final ConfigurationStyleDetector configurationStyleDetector;

    public TechnologyDetectionResult detect(String projectId, String storagePath) {
        List<ScannedFile> files = fileScanner.scan(storagePath);

        List<DetectedTechnology> detectedTechnologies = ruleCatalog.rules().stream()
                .map(rule -> evaluate(rule, files))
                .filter(java.util.Objects::nonNull)
                .sorted(Comparator.comparingInt(DetectedTechnology::getConfidenceScore).reversed())
                .toList();

        DetectedAttribute javaVersion = javaVersionDetector.detect(files, storagePath);
        DetectedAttribute springBootVersion = springBootVersionDetector.detect(files);
        DetectedAttribute servletVersion = servletVersionDetector.detect(files);

        TechnologyDetectionResult result = TechnologyDetectionResult.builder()
                .projectId(projectId)
                .detectedTechnologies(detectedTechnologies)
                .javaVersion(javaVersion)
                .jdkVersion(jdkVersionDetector.detect(files, storagePath, javaVersion))
                .buildTool(buildToolDetector.detect(files))
                .mavenVersion(mavenVersionDetector.detect(files))
                .gradleVersion(gradleVersionDetector.detect(files))
                .springVersion(springVersionDetector.detect(files, springBootVersion))
                .springBootVersion(springBootVersion)
                .servletVersion(servletVersion)
                .jspVersion(jspVersionDetector.detect(files, servletVersion))
                .hibernateVersion(hibernateVersionDetector.detect(files))
                .applicationServer(applicationServerDetector.detect(files))
                .packaging(packagingDetector.detect(files))
                .configurationStyles(configurationStyleDetector.detect(files))
                .databases(databaseDetector.detect(files))
                .build();

        log.info("Technology detection completed | projectId={} | technologiesFound={} | filesScanned={} | javaVersion={}",
                projectId, detectedTechnologies.size(), files.size(), javaVersion.getValue());
        return result;
    }

    private DetectedTechnology evaluate(TechnologyRule rule, List<ScannedFile> files) {
        int distinctSignalsMatched = 0;
        int totalOccurrences = 0;
        List<String> evidence = new ArrayList<>();

        for (TechnologySignal signal : rule.signals()) {
            int occurrences = 0;
            for (ScannedFile file : files) {
                if (signal.matcher().test(file)) {
                    occurrences++;
                    if (evidence.size() < MAX_EVIDENCE_SAMPLES) {
                        evidence.add(signal.description() + " (" + file.relativePath() + ")");
                    }
                }
            }
            if (occurrences > 0) {
                distinctSignalsMatched++;
                totalOccurrences += occurrences;
            }
        }

        if (distinctSignalsMatched == 0) {
            return null;
        }

        return DetectedTechnology.builder()
                .technology(rule.technology())
                .confidenceScore(ConfidenceScorer.score(distinctSignalsMatched, totalOccurrences))
                .evidence(evidence)
                .build();
    }

}
