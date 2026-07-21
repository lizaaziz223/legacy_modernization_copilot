package com.ailegacy.modernization.copilot.infrastructure.analysis;

import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.infrastructure.analysis.model.ScannedFile;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Detects the target application server from vendor-specific deployment
 * descriptors, falling back to a generic servlet container when only a plain
 * web.xml is present.
 */
@Component
public class ApplicationServerDetector {

    public DetectedAttribute detect(List<ScannedFile> files) {
        if (hasFile(files, "weblogic.xml")) {
            return found("Oracle WebLogic", "weblogic.xml deployment descriptor found");
        }
        if (hasFile(files, "weblogic-application.xml")) {
            return found("Oracle WebLogic", "weblogic-application.xml deployment descriptor found");
        }
        if (hasFile(files, "jboss-web.xml")) {
            return found("JBoss / WildFly", "jboss-web.xml deployment descriptor found");
        }
        if (hasFile(files, "jboss-deployment-structure.xml")) {
            return found("JBoss / WildFly", "jboss-deployment-structure.xml deployment descriptor found");
        }
        if (hasFile(files, "ibm-web-ext.xml")) {
            return found("IBM WebSphere", "ibm-web-ext.xml deployment descriptor found");
        }
        if (hasFile(files, "ibm-web-bnd.xml")) {
            return found("IBM WebSphere", "ibm-web-bnd.xml deployment descriptor found");
        }
        if (hasFile(files, "glassfish-web.xml")) {
            return found("GlassFish", "glassfish-web.xml deployment descriptor found");
        }
        if (hasFile(files, "sun-web.xml")) {
            return found("GlassFish", "sun-web.xml deployment descriptor found");
        }
        boolean hasTomcatContext = files.stream().anyMatch(
                f -> "context.xml".equalsIgnoreCase(f.fileName()) && f.content().toLowerCase().contains("catalina"));
        if (hasTomcatContext) {
            return found("Apache Tomcat", "context.xml references Catalina (Tomcat's servlet engine)");
        }
        if (hasFile(files, "web.xml")) {
            return DetectedAttribute.builder()
                    .value("Servlet Container (unspecified)")
                    .confidenceScore(40)
                    .evidence(List.of("web.xml found but no vendor-specific deployment descriptor to identify the server"))
                    .build();
        }
        return DetectedAttribute.unknown();
    }

    private DetectedAttribute found(String value, String evidence) {
        return DetectedAttribute.builder()
                .value(value)
                .confidenceScore(90)
                .evidence(List.of(evidence))
                .build();
    }

    private boolean hasFile(List<ScannedFile> files, String fileName) {
        return files.stream().anyMatch(f -> f.fileName().equalsIgnoreCase(fileName));
    }

}
