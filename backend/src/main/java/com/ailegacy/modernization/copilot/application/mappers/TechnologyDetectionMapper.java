package com.ailegacy.modernization.copilot.application.mappers;

import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.domain.entities.DetectedTechnology;
import com.ailegacy.modernization.copilot.domain.entities.TechnologyDetectionResult;
import com.ailegacy.modernization.copilot.interfaces.rest.dto.detection.DetectedAttributeResponse;
import com.ailegacy.modernization.copilot.interfaces.rest.dto.detection.DetectedTechnologyResponse;
import com.ailegacy.modernization.copilot.interfaces.rest.dto.detection.TechnologyDetectionResponse;
import org.springframework.stereotype.Component;

/**
 * Maps {@link TechnologyDetectionResult} entities to their read-only response DTO.
 */
@Component
public class TechnologyDetectionMapper {

    public TechnologyDetectionResponse toResponse(TechnologyDetectionResult result) {
        return TechnologyDetectionResponse.builder()
                .id(result.getId())
                .projectId(result.getProjectId())
                .detectedTechnologies(result.getDetectedTechnologies().stream()
                        .map(this::toResponse)
                        .toList())
                .javaVersion(toResponse(result.getJavaVersion()))
                .jdkVersion(toResponse(result.getJdkVersion()))
                .buildTool(toResponse(result.getBuildTool()))
                .mavenVersion(toResponse(result.getMavenVersion()))
                .gradleVersion(toResponse(result.getGradleVersion()))
                .springVersion(toResponse(result.getSpringVersion()))
                .springBootVersion(toResponse(result.getSpringBootVersion()))
                .servletVersion(toResponse(result.getServletVersion()))
                .jspVersion(toResponse(result.getJspVersion()))
                .hibernateVersion(toResponse(result.getHibernateVersion()))
                .applicationServer(toResponse(result.getApplicationServer()))
                .packaging(toResponse(result.getPackaging()))
                .configurationStyles(result.getConfigurationStyles().stream()
                        .map(this::toResponse)
                        .toList())
                .databases(result.getDatabases().stream()
                        .map(this::toResponse)
                        .toList())
                .createdAt(result.getCreatedAt())
                .build();
    }

    private DetectedTechnologyResponse toResponse(DetectedTechnology detected) {
        return DetectedTechnologyResponse.builder()
                .technology(detected.getTechnology())
                .confidenceScore(detected.getConfidenceScore())
                .evidence(detected.getEvidence())
                .build();
    }

    private DetectedAttributeResponse toResponse(DetectedAttribute attribute) {
        if (attribute == null) {
            attribute = DetectedAttribute.unknown();
        }
        return DetectedAttributeResponse.builder()
                .value(attribute.getValue())
                .confidenceScore(attribute.getConfidenceScore())
                .evidence(attribute.getEvidence())
                .build();
    }

}
