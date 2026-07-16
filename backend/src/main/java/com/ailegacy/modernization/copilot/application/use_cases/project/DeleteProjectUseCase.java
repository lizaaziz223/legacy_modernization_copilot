package com.ailegacy.modernization.copilot.application.use_cases.project;

import com.ailegacy.modernization.copilot.application.use_cases.UseCase;
import com.ailegacy.modernization.copilot.domain.entities.Project;
import com.ailegacy.modernization.copilot.domain.exceptions.ResourceNotFoundException;
import com.ailegacy.modernization.copilot.domain.repositories.ArchitectureAnalysisReportRepository;
import com.ailegacy.modernization.copilot.domain.repositories.BusinessAnalysisReportRepository;
import com.ailegacy.modernization.copilot.domain.repositories.GeneratedSpringBootCodeRepository;
import com.ailegacy.modernization.copilot.domain.repositories.ModernizationPlanRepository;
import com.ailegacy.modernization.copilot.domain.repositories.PerformanceAnalysisReportRepository;
import com.ailegacy.modernization.copilot.domain.repositories.ProjectRepository;
import com.ailegacy.modernization.copilot.domain.repositories.SecurityAnalysisReportRepository;
import com.ailegacy.modernization.copilot.domain.repositories.TechnologyDetectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.FileSystemUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * Permanently deletes a project: every derived analysis/report/plan, its
 * extracted files and original archive on disk, and the project record
 * itself.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DeleteProjectUseCase implements UseCase<DeleteProjectCommand, Void> {

    private final ProjectRepository projectRepository;
    private final TechnologyDetectionRepository technologyDetectionRepository;
    private final BusinessAnalysisReportRepository businessAnalysisReportRepository;
    private final ArchitectureAnalysisReportRepository architectureAnalysisReportRepository;
    private final SecurityAnalysisReportRepository securityAnalysisReportRepository;
    private final PerformanceAnalysisReportRepository performanceAnalysisReportRepository;
    private final ModernizationPlanRepository modernizationPlanRepository;
    private final GeneratedSpringBootCodeRepository generatedSpringBootCodeRepository;

    @Override
    public Void execute(DeleteProjectCommand command) {
        Project project = projectRepository.findByIdAndOwnerId(command.projectId(), command.ownerId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", command.projectId()));

        String projectId = project.getId();

        technologyDetectionRepository.deleteByProjectId(projectId);
        businessAnalysisReportRepository.deleteByProjectId(projectId);
        architectureAnalysisReportRepository.deleteByProjectId(projectId);
        securityAnalysisReportRepository.deleteByProjectId(projectId);
        performanceAnalysisReportRepository.deleteByProjectId(projectId);
        modernizationPlanRepository.deleteByProjectId(projectId);
        generatedSpringBootCodeRepository.deleteByProjectId(projectId);

        deleteExtractedFiles(project);
        deleteOriginalZip(project);

        projectRepository.deleteById(projectId);

        log.info("Project deleted | projectId={} | ownerId={}", projectId, command.ownerId());
        return null;
    }

    private void deleteExtractedFiles(Project project) {
        if (project.getStoragePath() == null || project.getStoragePath().isBlank()) {
            return;
        }
        FileSystemUtils.deleteRecursively(Paths.get(project.getStoragePath()).toFile());
    }

    private void deleteOriginalZip(Project project) {
        if (project.getOriginalZipPath() == null || project.getOriginalZipPath().isBlank()) {
            return;
        }
        try {
            Files.deleteIfExists(Paths.get(project.getOriginalZipPath()));
        } catch (IOException ex) {
            log.warn("Failed to delete original archive for projectId={}", project.getId(), ex);
        }
    }

}
