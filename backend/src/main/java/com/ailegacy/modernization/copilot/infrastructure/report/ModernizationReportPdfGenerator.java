package com.ailegacy.modernization.copilot.infrastructure.report;

import com.ailegacy.modernization.copilot.domain.entities.ArchitectureAnalysisReport;
import com.ailegacy.modernization.copilot.domain.entities.BusinessAnalysisReport;
import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.domain.entities.DetectedTechnology;
import com.ailegacy.modernization.copilot.domain.entities.GeneratedSpringBootCode;
import com.ailegacy.modernization.copilot.domain.entities.ModernizationPlan;
import com.ailegacy.modernization.copilot.domain.entities.PerformanceAnalysisReport;
import com.ailegacy.modernization.copilot.domain.entities.PerformanceFinding;
import com.ailegacy.modernization.copilot.domain.entities.PriorityMatrixItem;
import com.ailegacy.modernization.copilot.domain.entities.Project;
import com.ailegacy.modernization.copilot.domain.entities.RequiredTechnology;
import com.ailegacy.modernization.copilot.domain.entities.Risk;
import com.ailegacy.modernization.copilot.domain.entities.SecurityAnalysisReport;
import com.ailegacy.modernization.copilot.domain.entities.SecurityFinding;
import com.ailegacy.modernization.copilot.domain.entities.TechnologyDetectionResult;
import com.ailegacy.modernization.copilot.domain.enums.ModernTechnology;
import com.ailegacy.modernization.copilot.domain.exceptions.BusinessLogicException;
import com.ailegacy.modernization.copilot.infrastructure.report.model.ModernizationReportData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Compiles an Enterprise Modernization Report PDF from a project and every
 * prior analysis available for it (technology detection, business,
 * architecture, security, performance, migration plan, generated Spring Boot
 * sample). Any missing section renders a placeholder instead of failing -
 * none of the underlying analyses are required to have been run.
 */
@Slf4j
@Component
public class ModernizationReportPdfGenerator {

    private static final String NOT_YET_ANALYZED = "Not yet analyzed. Run this analysis to include it in the report.";
    private static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public byte[] generate(ModernizationReportData data) {
        try (PdfReportWriter writer = new PdfReportWriter()) {
            writeCoverSection(writer, data.project());
            writeExecutiveSummary(writer, data.businessAnalysis());
            writeTechnologyStack(writer, data.technologyDetection());
            writeArchitectureReview(writer, data.architectureAnalysis());
            writeSecurityReview(writer, data.securityAnalysis());
            writePerformanceReview(writer, data.performanceAnalysis());
            writeMigrationRoadmap(writer, data.modernizationPlan());
            writeSpringBootSample(writer, data.generatedSpringBootCode());
            writeCloudRecommendation(writer, data.modernizationPlan());
            return writer.toByteArray();
        } catch (IOException ex) {
            log.error("Failed to generate modernization report PDF | projectId={}", data.project().getId(), ex);
            throw new BusinessLogicException("Failed to generate modernization report PDF: " + ex.getMessage(), "REPORT_GENERATION_FAILED", ex);
        }
    }

    private void writeCoverSection(PdfReportWriter writer, Project project) throws IOException {
        writer.addTitle("Enterprise Modernization Report");
        writer.addKeyValue("Project", project.getName());
        writer.addKeyValue("Original archive", project.getOriginalFileName());
        writer.addKeyValue("Generated", TIMESTAMP_FORMAT.format(LocalDateTime.now()));
        writer.addSpacer(10f);
    }

    private void writeExecutiveSummary(PdfReportWriter writer, BusinessAnalysisReport report) throws IOException {
        writer.addHeading("1. Executive Summary");
        if (report == null) {
            writer.addParagraph(NOT_YET_ANALYZED);
            return;
        }
        writer.addParagraph(report.getExecutiveSummary());
        if (!report.getMainModules().isEmpty()) {
            writer.addSpacer(4f);
            writer.addKeyValue("Main modules", String.join(", ", report.getMainModules()));
        }
    }

    private void writeTechnologyStack(PdfReportWriter writer, TechnologyDetectionResult result) throws IOException {
        writer.addHeading("2. Technology Stack");
        if (result == null) {
            writer.addParagraph(NOT_YET_ANALYZED);
            return;
        }
        writer.addKeyValue("Java version", result.getJavaVersion().getValue());
        writer.addKeyValue("Build tool", result.getBuildTool().getValue());
        writer.addKeyValue("Application server", result.getApplicationServer().getValue());
        writer.addKeyValue("Database(s)", result.getDatabases().isEmpty()
                ? "Unknown"
                : result.getDatabases().stream().map(DetectedAttribute::getValue).collect(Collectors.joining(", ")));
        writer.addSpacer(4f);
        if (result.getDetectedTechnologies().isEmpty()) {
            writer.addParagraph("No legacy technologies were detected.");
        } else {
            for (DetectedTechnology tech : result.getDetectedTechnologies()) {
                writer.addBullet(tech.getTechnology().name() + " (confidence " + tech.getConfidenceScore() + "%)");
            }
        }
    }

    private void writeArchitectureReview(PdfReportWriter writer, ArchitectureAnalysisReport report) throws IOException {
        writer.addHeading("3. Architecture Review");
        if (report == null) {
            writer.addParagraph(NOT_YET_ANALYZED);
            return;
        }
        writer.addKeyValue("Current pattern", report.getDetectedPattern().name());
        writer.addKeyValue("Architecture score", report.getArchitectureScore() + "/100");
        writer.addParagraph(report.getArchitectureScoreJustification());
        writer.addParagraph(report.getCurrentArchitectureDescription());
        writer.addKeyValue("Recommended target pattern", report.getTargetArchitecturePattern().name());
        writer.addParagraph(report.getTargetArchitectureDescription());
        if (!report.getRecommendations().isEmpty()) {
            writer.addSpacer(4f);
            for (String recommendation : report.getRecommendations()) {
                writer.addBullet(recommendation);
            }
        }
    }

    private void writeSecurityReview(PdfReportWriter writer, SecurityAnalysisReport report) throws IOException {
        writer.addHeading("4. Security Review");
        if (report == null) {
            writer.addParagraph(NOT_YET_ANALYZED);
            return;
        }
        writer.addKeyValue("Overall risk score", report.getOverallRiskScore() + "/100");
        if (report.getFindings().isEmpty()) {
            writer.addParagraph("No security issues were found.");
            return;
        }
        for (SecurityFinding finding : report.getFindings()) {
            writer.addSpacer(4f);
            writer.addKeyValue(finding.getSeverity().name(), finding.getTitle());
            writer.addParagraph(finding.getDescription());
            writer.addKeyValue("Recommendation", finding.getRecommendation());
            writer.addKeyValue("Modern alternative", finding.getModernAlternative());
        }
    }

    private void writePerformanceReview(PdfReportWriter writer, PerformanceAnalysisReport report) throws IOException {
        writer.addHeading("5. Performance Review");
        if (report == null) {
            writer.addParagraph(NOT_YET_ANALYZED);
            return;
        }
        writer.addKeyValue("Performance score", report.getPerformanceScore() + "/100");
        writer.addParagraph(report.getPerformanceScoreJustification());
        if (report.getFindings().isEmpty()) {
            writer.addParagraph("No performance issues were found.");
            return;
        }
        for (PerformanceFinding finding : report.getFindings()) {
            writer.addSpacer(4f);
            writer.addKeyValue(finding.getIssueType().name(), finding.getTitle());
            writer.addParagraph(finding.getDescription());
            writer.addKeyValue("Optimization", finding.getOptimizationSuggestion());
            writer.addKeyValue("Modern alternative", finding.getModernAlternative());
        }
    }

    private void writeMigrationRoadmap(PdfReportWriter writer, ModernizationPlan plan) throws IOException {
        writer.addHeading("6. Migration Roadmap");
        if (plan == null) {
            writer.addParagraph(NOT_YET_ANALYZED);
            return;
        }
        writer.addParagraph(plan.getMigrationStrategy());
        writer.addKeyValue("Estimated timeline", plan.getEstimatedTimeline());
        writer.addKeyValue("Migration complexity", plan.getMigrationComplexity().name());

        if (!plan.getPriorityMatrix().isEmpty()) {
            writer.addSpacer(4f);
            writer.addSubheading("Priority matrix");
            for (PriorityMatrixItem item : plan.getPriorityMatrix()) {
                writer.addBullet(item.getItem() + " (impact: " + item.getImpact() + ", effort: " + item.getEffort() + ")");
            }
        }

        if (!plan.getQuickWins().isEmpty()) {
            writer.addSpacer(4f);
            writer.addSubheading("Quick wins");
            for (String win : plan.getQuickWins()) {
                writer.addBullet(win);
            }
        }

        if (!plan.getRisks().isEmpty()) {
            writer.addSpacer(4f);
            writer.addSubheading("Risks");
            for (Risk risk : plan.getRisks()) {
                writer.addBullet("[" + risk.getSeverity() + "] " + risk.getDescription());
            }
        }
    }

    private void writeSpringBootSample(PdfReportWriter writer, GeneratedSpringBootCode code) throws IOException {
        writer.addHeading("7. Spring Boot Sample");
        if (code == null) {
            writer.addParagraph(NOT_YET_ANALYZED);
            return;
        }
        writer.addParagraph(code.getExplanation());
        writer.addSpacer(4f);
        addNamedCodeBlock(writer, "Entity", code.getEntityCode());
        addNamedCodeBlock(writer, "Repository", code.getRepositoryCode());
        addNamedCodeBlock(writer, "DTO", code.getDtoCode());
        addNamedCodeBlock(writer, "Service", code.getServiceCode());
        addNamedCodeBlock(writer, "Controller", code.getControllerCode());
    }

    private void addNamedCodeBlock(PdfReportWriter writer, String label, String code) throws IOException {
        if (code == null || code.isBlank()) {
            return;
        }
        writer.addSubheading(label);
        writer.addCodeBlock(code);
    }

    private void writeCloudRecommendation(PdfReportWriter writer, ModernizationPlan plan) throws IOException {
        writer.addHeading("8. Cloud Recommendation");
        if (plan == null) {
            writer.addParagraph(NOT_YET_ANALYZED);
            return;
        }
        Optional<RequiredTechnology> cloudRecommendation = plan.getRequiredTechnologies().stream()
                .filter(rt -> rt.getTechnology() == ModernTechnology.CLOUD_MIGRATION)
                .findFirst();

        if (cloudRecommendation.isEmpty()) {
            writer.addParagraph(NOT_YET_ANALYZED);
            return;
        }

        RequiredTechnology recommendation = cloudRecommendation.get();
        writer.addKeyValue("Recommended", recommendation.isRecommended() ? "Yes" : "No");
        writer.addParagraph(recommendation.getReason());
    }

}
