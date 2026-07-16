package com.ailegacy.modernization.copilot.application.mappers;

import com.ailegacy.modernization.copilot.domain.entities.Project;
import com.ailegacy.modernization.copilot.interfaces.rest.dto.project.ProjectSummaryResponse;
import org.springframework.stereotype.Component;

/**
 * Maps {@link Project} entities to the read-only {@link ProjectSummaryResponse} DTO.
 */
@Component
public class ProjectSummaryMapper {

    public ProjectSummaryResponse toSummaryResponse(Project project) {
        return ProjectSummaryResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .originalFileName(project.getOriginalFileName())
                .totalFiles(project.getTotalFiles())
                .totalFolders(project.getTotalFolders())
                .totalSizeBytes(project.getTotalSizeBytes())
                .fileExtensionBreakdown(project.getFileExtensionBreakdown())
                .createdAt(project.getCreatedAt())
                .build();
    }

}
