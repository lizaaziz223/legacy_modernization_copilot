package com.ailegacy.modernization.copilot.interfaces.rest.dto.project;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSummaryResponse {

    private String id;
    private String name;
    private String originalFileName;
    private long totalFiles;
    private long totalFolders;
    private long totalSizeBytes;
    private Map<String, Long> fileExtensionBreakdown;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant createdAt;

}
