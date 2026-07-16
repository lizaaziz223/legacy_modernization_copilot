package com.ailegacy.modernization.copilot.application.use_cases.project;

import com.ailegacy.modernization.copilot.application.use_cases.UseCase;
import com.ailegacy.modernization.copilot.domain.entities.Project;
import com.ailegacy.modernization.copilot.domain.exceptions.ResourceNotFoundException;
import com.ailegacy.modernization.copilot.domain.repositories.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Reads the original uploaded archive back off disk for download.
 */
@Component
@RequiredArgsConstructor
public class DownloadOriginalZipUseCase implements UseCase<GetProjectCommand, OriginalZipFile> {

    private final ProjectRepository projectRepository;

    @Override
    public OriginalZipFile execute(GetProjectCommand command) {
        Project project = projectRepository.findByIdAndOwnerId(command.projectId(), command.ownerId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", command.projectId()));

        if (project.getOriginalZipPath() == null || project.getOriginalZipPath().isBlank()) {
            throw new ResourceNotFoundException("Original archive for project", project.getId());
        }

        Path zipPath = Paths.get(project.getOriginalZipPath());
        if (!Files.exists(zipPath)) {
            throw new ResourceNotFoundException("Original archive for project", project.getId());
        }

        try {
            byte[] content = Files.readAllBytes(zipPath);
            return new OriginalZipFile(content, project.getName() + ".zip");
        } catch (IOException ex) {
            throw new ResourceNotFoundException("Original archive for project", project.getId());
        }
    }

}
