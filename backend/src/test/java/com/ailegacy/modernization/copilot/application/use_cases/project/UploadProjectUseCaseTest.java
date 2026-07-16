package com.ailegacy.modernization.copilot.application.use_cases.project;

import com.ailegacy.modernization.copilot.application.mappers.ProjectSummaryMapper;
import com.ailegacy.modernization.copilot.domain.entities.Project;
import com.ailegacy.modernization.copilot.domain.repositories.ProjectRepository;
import com.ailegacy.modernization.copilot.infrastructure.storage.ExtractionResult;
import com.ailegacy.modernization.copilot.infrastructure.storage.ZipProjectExtractor;
import com.ailegacy.modernization.copilot.interfaces.rest.dto.project.ProjectSummaryResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UploadProjectUseCaseTest {

    @Mock
    private ZipProjectExtractor zipProjectExtractor;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectSummaryMapper projectSummaryMapper;

    private UploadProjectUseCase uploadProjectUseCase;

    @BeforeEach
    void setUp() {
        uploadProjectUseCase = new UploadProjectUseCase(zipProjectExtractor, projectRepository, projectSummaryMapper);
    }

    @Test
    void extractsThenPersistsProjectWithComputedTotals() {
        MockMultipartFile zip = new MockMultipartFile("file", "LegacyBillingSystem.zip", "application/zip", new byte[]{1});
        UploadProjectCommand command = new UploadProjectCommand(zip, "owner-1");

        ExtractionResult extractionResult = new ExtractionResult(
                "/data/projects/generated-id", "/data/projects/generated-id.zip", 3, 4096, Map.of("java", 2L, "xml", 1L)
        );
        when(zipProjectExtractor.extract(any(), anyString())).thenReturn(extractionResult);
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));
        ProjectSummaryResponse expectedResponse = ProjectSummaryResponse.builder().name("LegacyBillingSystem").build();
        when(projectSummaryMapper.toSummaryResponse(any(Project.class))).thenReturn(expectedResponse);

        ProjectSummaryResponse response = uploadProjectUseCase.execute(command);

        assertThat(response).isEqualTo(expectedResponse);

        ArgumentCaptor<Project> projectCaptor = ArgumentCaptor.forClass(Project.class);
        verify(projectRepository).save(projectCaptor.capture());
        Project savedProject = projectCaptor.getValue();
        assertThat(savedProject.getOwnerId()).isEqualTo("owner-1");
        assertThat(savedProject.getName()).isEqualTo("LegacyBillingSystem");
        assertThat(savedProject.getOriginalFileName()).isEqualTo("LegacyBillingSystem.zip");
        assertThat(savedProject.getTotalFiles()).isEqualTo(3);
        assertThat(savedProject.getTotalSizeBytes()).isEqualTo(4096);
        assertThat(savedProject.getFileExtensionBreakdown()).containsEntry("java", 2L);
        assertThat(savedProject.getId()).isNotBlank();
    }

}
