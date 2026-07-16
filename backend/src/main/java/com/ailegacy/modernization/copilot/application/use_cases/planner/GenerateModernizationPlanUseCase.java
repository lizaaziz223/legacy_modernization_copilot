package com.ailegacy.modernization.copilot.application.use_cases.planner;

import com.ailegacy.modernization.copilot.application.mappers.ModernizationPlanMapper;
import com.ailegacy.modernization.copilot.application.use_cases.UseCase;
import com.ailegacy.modernization.copilot.application.use_cases.project.GetProjectCommand;
import com.ailegacy.modernization.copilot.domain.entities.ArchitectureAnalysisReport;
import com.ailegacy.modernization.copilot.domain.entities.BusinessAnalysisReport;
import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.domain.entities.ModernizationPlan;
import com.ailegacy.modernization.copilot.domain.entities.PerformanceAnalysisReport;
import com.ailegacy.modernization.copilot.domain.entities.PerformanceFinding;
import com.ailegacy.modernization.copilot.domain.entities.Project;
import com.ailegacy.modernization.copilot.domain.entities.SecurityAnalysisReport;
import com.ailegacy.modernization.copilot.domain.entities.SecurityFinding;
import com.ailegacy.modernization.copilot.domain.entities.TechnologyDetectionResult;
import com.ailegacy.modernization.copilot.domain.exceptions.ResourceNotFoundException;
import com.ailegacy.modernization.copilot.domain.repositories.ArchitectureAnalysisReportRepository;
import com.ailegacy.modernization.copilot.domain.repositories.BusinessAnalysisReportRepository;
import com.ailegacy.modernization.copilot.domain.repositories.ModernizationPlanRepository;
import com.ailegacy.modernization.copilot.domain.repositories.PerformanceAnalysisReportRepository;
import com.ailegacy.modernization.copilot.domain.repositories.ProjectRepository;
import com.ailegacy.modernization.copilot.domain.repositories.SecurityAnalysisReportRepository;
import com.ailegacy.modernization.copilot.domain.repositories.TechnologyDetectionRepository;
import com.ailegacy.modernization.copilot.infrastructure.ai.ModernizationPlanner;
import com.ailegacy.modernization.copilot.infrastructure.ai.model.ModernizationContext;
import com.ailegacy.modernization.copilot.interfaces.rest.dto.planner.ModernizationPlanResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

/**
 * Runs the modernization planner against an uploaded project and persists the
 * resulting roadmap.
 *
 * Synthesizes whatever prior analyses exist (technology detection, business,
 * architecture, security, performance) into extra prompt context; none of
 * them are required for a plan to be generated.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GenerateModernizationPlanUseCase implements UseCase<GetProjectCommand, ModernizationPlanResponse> {

    private static final int MAX_FINDINGS_IN_SUMMARY = 3;

    private final ProjectRepository projectRepository;
    private final ModernizationPlanRepository modernizationPlanRepository;
    private final TechnologyDetectionRepository technologyDetectionRepository;
    private final BusinessAnalysisReportRepository businessAnalysisReportRepository;
    private final ArchitectureAnalysisReportRepository architectureAnalysisReportRepository;
    private final SecurityAnalysisReportRepository securityAnalysisReportRepository;
    private final PerformanceAnalysisReportRepository performanceAnalysisReportRepository;
    private final ModernizationPlanner modernizationPlanner;
    private final ModernizationPlanMapper modernizationPlanMapper;

    @Override
    public ModernizationPlanResponse execute(GetProjectCommand command) {
        Project project = projectRepository.findByIdAndOwnerId(command.projectId(), command.ownerId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", command.projectId()));

        ModernizationContext context = buildContext(project.getId());

        ModernizationPlan plan = modernizationPlanner.plan(project.getId(), project.getName(), project.getStoragePath(), context);

        // Re-running planning replaces the previous plan rather than accumulating duplicates.
        modernizationPlanRepository.deleteByProjectId(project.getId());
        ModernizationPlan saved = modernizationPlanRepository.save(plan);

        log.info("Modernization plan stored | projectId={} | complexity={}", project.getId(), saved.getMigrationComplexity());
        return modernizationPlanMapper.toResponse(saved);
    }

    private ModernizationContext buildContext(String projectId) {
        String technologySummary = technologyDetectionRepository.findByProjectId(projectId)
                .map(this::summarize)
                .orElse(null);
        String businessSummary = businessAnalysisReportRepository.findByProjectId(projectId)
                .map(this::summarize)
                .orElse(null);
        String architectureSummary = architectureAnalysisReportRepository.findByProjectId(projectId)
                .map(this::summarize)
                .orElse(null);
        String securitySummary = securityAnalysisReportRepository.findByProjectId(projectId)
                .map(this::summarize)
                .orElse(null);
        String performanceSummary = performanceAnalysisReportRepository.findByProjectId(projectId)
                .map(this::summarize)
                .orElse(null);

        return new ModernizationContext(technologySummary, businessSummary, architectureSummary, securitySummary, performanceSummary);
    }

    private String summarize(TechnologyDetectionResult result) {
        String technologies = result.getDetectedTechnologies().stream()
                .map(t -> t.getTechnology().name())
                .collect(Collectors.joining(", "));
        String databases = result.getDatabases().stream()
                .map(DetectedAttribute::getValue)
                .collect(Collectors.joining(", "));
        return "Technologies: %s. Java version: %s. Database: %s. Build tool: %s. Application server: %s.".formatted(
                technologies.isBlank() ? "none detected" : technologies,
                result.getJavaVersion().getValue(),
                databases,
                result.getBuildTool().getValue(),
                result.getApplicationServer().getValue()
        );
    }

    private String summarize(BusinessAnalysisReport report) {
        return "Purpose: %s Main modules: %s.".formatted(
                report.getBusinessPurpose(),
                String.join(", ", report.getMainModules())
        );
    }

    private String summarize(ArchitectureAnalysisReport report) {
        return "Current pattern: %s (score %d/100). Recommended target: %s. %s".formatted(
                report.getDetectedPattern(),
                report.getArchitectureScore(),
                report.getTargetArchitecturePattern(),
                report.getCurrentArchitectureDescription()
        );
    }

    private String summarize(SecurityAnalysisReport report) {
        String topFindings = report.getFindings().stream()
                .limit(MAX_FINDINGS_IN_SUMMARY)
                .map(SecurityFinding::getTitle)
                .collect(Collectors.joining("; "));
        return "Overall risk score: %d/100. %d findings. Top issues: %s.".formatted(
                report.getOverallRiskScore(),
                report.getFindings().size(),
                topFindings.isBlank() ? "none" : topFindings
        );
    }

    private String summarize(PerformanceAnalysisReport report) {
        String topFindings = report.getFindings().stream()
                .limit(MAX_FINDINGS_IN_SUMMARY)
                .map(PerformanceFinding::getTitle)
                .collect(Collectors.joining("; "));
        return "Performance score: %d/100 (%s). %d findings. Top issues: %s.".formatted(
                report.getPerformanceScore(),
                report.getPerformanceScoreJustification(),
                report.getFindings().size(),
                topFindings.isBlank() ? "none" : topFindings
        );
    }

}
