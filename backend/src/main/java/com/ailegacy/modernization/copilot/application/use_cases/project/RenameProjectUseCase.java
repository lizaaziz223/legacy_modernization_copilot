package com.ailegacy.modernization.copilot.application.use_cases.project;

import com.ailegacy.modernization.copilot.application.mappers.ProjectSummaryMapper;
import com.ailegacy.modernization.copilot.application.use_cases.UseCase;
import com.ailegacy.modernization.copilot.domain.entities.Project;
import com.ailegacy.modernization.copilot.domain.exceptions.ResourceNotFoundException;
import com.ailegacy.modernization.copilot.domain.exceptions.ValidationException;
import com.ailegacy.modernization.copilot.domain.repositories.ProjectRepository;
import com.ailegacy.modernization.copilot.interfaces.rest.dto.project.ProjectSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Renames a project, scoped to its owner.
 */
@Component
@RequiredArgsConstructor
public class RenameProjectUseCase implements UseCase<RenameProjectCommand, ProjectSummaryResponse> {

    private final ProjectRepository projectRepository;
    private final ProjectSummaryMapper projectSummaryMapper;

    @Override
    public ProjectSummaryResponse execute(RenameProjectCommand command) {
        if (command.newName() == null || command.newName().isBlank()) {
            throw new ValidationException("Project name must not be blank");
        }

        Project project = projectRepository.findByIdAndOwnerId(command.projectId(), command.ownerId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", command.projectId()));

        project.setName(command.newName().trim());
        Project saved = projectRepository.save(project);

        return projectSummaryMapper.toSummaryResponse(saved);
    }

}
