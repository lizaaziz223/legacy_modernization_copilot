package com.ailegacy.modernization.copilot.interfaces.rest.controllers;

import com.ailegacy.modernization.copilot.application.use_cases.project.DeleteProjectCommand;
import com.ailegacy.modernization.copilot.application.use_cases.project.DeleteProjectUseCase;
import com.ailegacy.modernization.copilot.application.use_cases.project.DownloadOriginalZipUseCase;
import com.ailegacy.modernization.copilot.application.use_cases.project.GetProjectCommand;
import com.ailegacy.modernization.copilot.application.use_cases.project.GetProjectUseCase;
import com.ailegacy.modernization.copilot.application.use_cases.project.ListProjectsUseCase;
import com.ailegacy.modernization.copilot.application.use_cases.project.OriginalZipFile;
import com.ailegacy.modernization.copilot.application.use_cases.project.RenameProjectCommand;
import com.ailegacy.modernization.copilot.application.use_cases.project.RenameProjectUseCase;
import com.ailegacy.modernization.copilot.application.use_cases.project.UploadProjectCommand;
import com.ailegacy.modernization.copilot.application.use_cases.project.UploadProjectUseCase;
import com.ailegacy.modernization.copilot.infrastructure.security.UserPrincipal;
import com.ailegacy.modernization.copilot.interfaces.rest.dto.ApiResponse;
import com.ailegacy.modernization.copilot.interfaces.rest.dto.project.ProjectSummaryResponse;
import com.ailegacy.modernization.copilot.interfaces.rest.dto.project.RenameProjectRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Project upload and history endpoints.
 */
@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Upload legacy project archives and review project history")
public class ProjectController {

    private final UploadProjectUseCase uploadProjectUseCase;
    private final ListProjectsUseCase listProjectsUseCase;
    private final GetProjectUseCase getProjectUseCase;
    private final RenameProjectUseCase renameProjectUseCase;
    private final DeleteProjectUseCase deleteProjectUseCase;
    private final DownloadOriginalZipUseCase downloadOriginalZipUseCase;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Upload a project archive",
            description = "Extracts a ZIP archive, keeping only supported file types, and stores the resulting project",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
            )
    )
    public ApiResponse<ProjectSummaryResponse> upload(
            @Parameter(description = "ZIP archive containing the legacy project source")
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ProjectSummaryResponse response = uploadProjectUseCase.execute(new UploadProjectCommand(file, principal.getId()));
        return ApiResponse.success(response, "Project uploaded successfully");
    }

    @GetMapping
    @Operation(summary = "List uploaded projects", description = "Returns the current user's upload history, most recent first")
    public ApiResponse<List<ProjectSummaryResponse>> list(@AuthenticationPrincipal UserPrincipal principal) {
        List<ProjectSummaryResponse> response = listProjectsUseCase.execute(principal.getId());
        return ApiResponse.success(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project summary", description = "Returns the summary for a single previously uploaded project")
    public ApiResponse<ProjectSummaryResponse> get(@PathVariable String id, @AuthenticationPrincipal UserPrincipal principal) {
        ProjectSummaryResponse response = getProjectUseCase.execute(new GetProjectCommand(id, principal.getId()));
        return ApiResponse.success(response);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Rename a project", description = "Updates the display name of a previously uploaded project")
    public ApiResponse<ProjectSummaryResponse> rename(
            @PathVariable String id,
            @Valid @RequestBody RenameProjectRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ProjectSummaryResponse response = renameProjectUseCase.execute(
                new RenameProjectCommand(id, principal.getId(), request.getName())
        );
        return ApiResponse.success(response, "Project renamed successfully");
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete a project",
            description = "Permanently removes the project, its uploaded archive, extracted files, and every derived "
                    + "analysis, report, and migration plan"
    )
    public ApiResponse<Void> delete(@PathVariable String id, @AuthenticationPrincipal UserPrincipal principal) {
        deleteProjectUseCase.execute(new DeleteProjectCommand(id, principal.getId()));
        return ApiResponse.success(null, "Project deleted successfully");
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download the original archive", description = "Downloads the ZIP archive as originally uploaded")
    public ResponseEntity<byte[]> download(@PathVariable String id, @AuthenticationPrincipal UserPrincipal principal) {
        OriginalZipFile zip = downloadOriginalZipUseCase.execute(new GetProjectCommand(id, principal.getId()));

        ContentDisposition contentDisposition = ContentDisposition.attachment()
                .filename(zip.suggestedFilename())
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("application/zip"))
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                .body(zip.content());
    }

}
