package com.ailegacy.modernization.copilot.interfaces.rest.dto.detection;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetectedAttributeResponse {

    private String value;
    private int confidenceScore;
    private List<String> evidence;

}
