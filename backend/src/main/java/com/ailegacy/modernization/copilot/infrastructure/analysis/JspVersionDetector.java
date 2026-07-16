package com.ailegacy.modernization.copilot.infrastructure.analysis;

import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.infrastructure.analysis.model.ScannedFile;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Determines the JSP (Jakarta Pages, from Servlet 5.0 onward) version.
 * JSP files rarely declare their own version, so this is paired off the
 * detected Servlet version using the specification's standard pairing.
 */
@Component
public class JspVersionDetector {

    private static final Map<String, String> SERVLET_TO_JSP = Map.of(
            "6.0", "3.1", "5.0", "3.0", "4.0", "2.3", "3.1", "2.3", "3.0", "2.2", "2.5", "2.1", "2.4", "2.0"
    );

    public DetectedAttribute detect(List<ScannedFile> files, DetectedAttribute servletVersion) {
        boolean hasJspFiles = files.stream().anyMatch(f -> "jsp".equalsIgnoreCase(f.extension()));
        if (!hasJspFiles) {
            return DetectedAttribute.builder()
                    .value("Not applicable")
                    .confidenceScore(100)
                    .evidence(List.of("No .jsp files found in the uploaded project"))
                    .build();
        }

        String jspVersion = SERVLET_TO_JSP.get(servletVersion.getValue());
        if (jspVersion != null) {
            return DetectedAttribute.builder()
                    .value(jspVersion)
                    .confidenceScore(Math.max(0, servletVersion.getConfidenceScore() - 10))
                    .evidence(List.of(
                            "Detected Servlet " + servletVersion.getValue() + " conventionally pairs with JSP/Jakarta Pages " + jspVersion
                    ))
                    .build();
        }

        return DetectedAttribute.builder()
                .value(DetectedAttribute.UNKNOWN_VALUE)
                .confidenceScore(20)
                .evidence(List.of(
                        ".jsp files are present, but the Servlet version (" + servletVersion.getValue() + ") could not be paired to a specific JSP version"
                ))
                .build();
    }

}
