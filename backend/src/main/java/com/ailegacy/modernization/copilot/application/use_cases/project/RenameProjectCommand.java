package com.ailegacy.modernization.copilot.application.use_cases.project;

/**
 * Input for {@link RenameProjectUseCase}.
 */
public record RenameProjectCommand(String projectId, String ownerId, String newName) {
}
