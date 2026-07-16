package com.ailegacy.modernization.copilot.application.use_cases.project;

/**
 * Input for {@link DeleteProjectUseCase}.
 */
public record DeleteProjectCommand(String projectId, String ownerId) {
}
