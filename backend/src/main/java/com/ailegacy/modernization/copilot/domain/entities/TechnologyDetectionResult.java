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
import java.util.List;

/**
 * Result of running the technology detection agent against an uploaded project,
 * persisted in the {@code technology_detections} collection.
 *
 * Every attribute below is a {@link DetectedAttribute}: a value plus a
 * confidence score and the evidence that produced it, so the UI can always
 * explain *why* a version or technology was reported, not just what it is.
 *
 * This is a terminal artifact for its pipeline stage: detection does not trigger
 * or feed into architecture analysis automatically.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "technology_detections")
public class TechnologyDetectionResult {

    @Id
    private String id;

    @Indexed(unique = true)
    private String projectId;

    private List<DetectedTechnology> detectedTechnologies;

    private DetectedAttribute javaVersion;
    private DetectedAttribute jdkVersion;
    private DetectedAttribute buildTool;
    private DetectedAttribute mavenVersion;
    private DetectedAttribute gradleVersion;
    private DetectedAttribute springVersion;
    private DetectedAttribute springBootVersion;
    private DetectedAttribute servletVersion;
    private DetectedAttribute jspVersion;
    private DetectedAttribute hibernateVersion;
    private DetectedAttribute applicationServer;
    private DetectedAttribute packaging;
    private List<DetectedAttribute> configurationStyles;
    private List<DetectedAttribute> databases;

    @CreatedDate
    private Instant createdAt;

}
