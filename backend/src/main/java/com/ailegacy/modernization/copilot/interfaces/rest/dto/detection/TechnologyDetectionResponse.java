package com.ailegacy.modernization.copilot.interfaces.rest.dto.detection;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnologyDetectionResponse {

    private String id;
    private String projectId;
    private List<DetectedTechnologyResponse> detectedTechnologies;

    private DetectedAttributeResponse javaVersion;
    private DetectedAttributeResponse jdkVersion;
    private DetectedAttributeResponse buildTool;
    private DetectedAttributeResponse mavenVersion;
    private DetectedAttributeResponse gradleVersion;
    private DetectedAttributeResponse springVersion;
    private DetectedAttributeResponse springBootVersion;
    private DetectedAttributeResponse servletVersion;
    private DetectedAttributeResponse jspVersion;
    private DetectedAttributeResponse hibernateVersion;
    private DetectedAttributeResponse applicationServer;
    private DetectedAttributeResponse packaging;
    private List<DetectedAttributeResponse> configurationStyles;
    private List<DetectedAttributeResponse> databases;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant createdAt;

}
