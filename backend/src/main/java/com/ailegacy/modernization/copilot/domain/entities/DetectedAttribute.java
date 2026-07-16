package com.ailegacy.modernization.copilot.domain.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * A single detected project attribute (a version, a build tool, a packaging
 * style, ...) together with how confident the detector is and the evidence
 * that led to that value. Embedded within {@link TechnologyDetectionResult},
 * not persisted independently.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetectedAttribute {

    public static final String UNKNOWN_VALUE = "Unknown";

    private String value;

    private int confidenceScore;

    private List<String> evidence;

    public static DetectedAttribute unknown() {
        return DetectedAttribute.builder()
                .value(UNKNOWN_VALUE)
                .confidenceScore(0)
                .evidence(List.of("No evidence found in the extracted project"))
                .build();
    }

}
