package com.ailegacy.modernization.copilot.application.use_cases.project;

import com.ailegacy.modernization.copilot.application.mappers.ProjectSummaryMapper;
import com.ailegacy.modernization.copilot.application.use_cases.UseCase;
import com.ailegacy.modernization.copilot.domain.entities.Project;
import com.ailegacy.modernization.copilot.domain.repositories.ProjectRepository;
import com.ailegacy.modernization.copilot.infrastructure.storage.ExtractionResult;
import com.ailegacy.modernization.copilot.infrastructure.storage.ZipProjectExtractor;
import com.ailegacy.modernization.copilot.infrastructure.utils.StringUtils;
import com.ailegacy.modernization.copilot.interfaces.rest.dto.project.ProjectSummaryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Extracts an uploaded ZIP archive and persists the resulting project metadata.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UploadProjectUseCase implements UseCase<UploadProjectCommand, ProjectSummaryResponse> {

    private static final String ZIP_SUFFIX = ".zip";

    private final ZipProjectExtractor zipProjectExtractor;
    private final ProjectRepository projectRepository;
    private final ProjectSummaryMapper projectSummaryMapper;

    @Override
    public ProjectSummaryResponse execute(UploadProjectCommand command) {
        String projectId = StringUtils.generateId();
        ExtractionResult result = zipProjectExtractor.extract(command.file(), projectId);

        Project project = Project.builder()
                .id(projectId)
                .ownerId(command.ownerId())
                .name(deriveProjectName(command.file().getOriginalFilename()))
                .originalFileName(command.file().getOriginalFilename())
                .storagePath(result.storagePath())
                .originalZipPath(result.originalZipPath())
                .totalFiles(result.totalFiles())
                .totalSizeBytes(result.totalSizeBytes())
                .fileExtensionBreakdown(result.fileExtensionBreakdown())
                .build();

        Project saved = projectRepository.save(project);
        log.info("Project uploaded | projectId={} | ownerId={} | files={} | sizeBytes={}",
                saved.getId(), saved.getOwnerId(), saved.getTotalFiles(), saved.getTotalSizeBytes());

        return projectSummaryMapper.toSummaryResponse(saved);
    }

    private String deriveProjectName(String originalFilename) {
        if (originalFilename == null) {
            return "Untitled Project";
        }
        String lower = originalFilename.toLowerCase(Locale.ROOT);
        String name = lower.endsWith(ZIP_SUFFIX)
                ? originalFilename.substring(0, originalFilename.length() - ZIP_SUFFIX.length())
                : originalFilename;
        return name.trim();
    }

}
