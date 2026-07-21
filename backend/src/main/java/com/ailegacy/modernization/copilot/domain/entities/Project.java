package com.ailegacy.modernization.copilot.domain.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

/**
 * A legacy project uploaded for modernization analysis, persisted in the
 * {@code projects} collection.
 *
 * Only files matching a supported extension are extracted and counted;
 * everything else in the uploaded archive is discarded.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "projects")
public class Project {

    @Id
    private String id;

    @Indexed
    private String ownerId;

    private String name;

    private String originalFileName;

    private String storagePath;

    private String originalZipPath;

    private long totalFiles;

    private long totalFolders;

    private long totalSizeBytes;

    private Map<String, Long> fileExtensionBreakdown;

    @CreatedDate
    private Instant createdAt;

}
