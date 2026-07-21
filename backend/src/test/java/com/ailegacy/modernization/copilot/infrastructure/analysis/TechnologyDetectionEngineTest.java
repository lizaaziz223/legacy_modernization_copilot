package com.ailegacy.modernization.copilot.infrastructure.analysis;

import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.domain.entities.DetectedTechnology;
import com.ailegacy.modernization.copilot.domain.entities.TechnologyDetectionResult;
import com.ailegacy.modernization.copilot.domain.enums.TechnologyType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Exercises the full detection pipeline (scanner + rule catalog + metadata
 * detectors) against a synthetic project touching every supported technology,
 * with no mocking - these components are all pure and deterministic.
 */
class TechnologyDetectionEngineTest {

    @TempDir
    Path projectDir;

    private TechnologyDetectionEngine engine;

    @BeforeEach
    void setUp() {
        ClassFileVersionReader classFileVersionReader = new ClassFileVersionReader();
        engine = new TechnologyDetectionEngine(
                new ProjectFileScanner(),
                new TechnologyRuleCatalog(),
                new JavaVersionDetector(classFileVersionReader),
                new JdkVersionDetector(classFileVersionReader),
                new DatabaseDetector(),
                new BuildToolDetector(),
                new ApplicationServerDetector(),
                new MavenVersionDetector(),
                new GradleVersionDetector(),
                new SpringVersionDetector(),
                new SpringBootVersionDetector(),
                new ServletVersionDetector(),
                new JspVersionDetector(),
                new HibernateVersionDetector(),
                new PackagingDetector(),
                new ConfigurationStyleDetector()
        );
    }

    @Test
    void detectsEveryTechnologyWithMetadataFromASyntheticLegacyProject() throws IOException {
        writeFixtureProject(projectDir);

        TechnologyDetectionResult result = engine.detect("project-x", projectDir.toString());

        Map<TechnologyType, DetectedTechnology> byType = result.getDetectedTechnologies().stream()
                .collect(Collectors.toMap(DetectedTechnology::getTechnology, d -> d));

        assertThat(byType).containsKeys(
                TechnologyType.SERVLET, TechnologyType.JSP, TechnologyType.SPRING_MVC,
                TechnologyType.SPRING_XML, TechnologyType.JDBC, TechnologyType.HIBERNATE,
                TechnologyType.EJB, TechnologyType.COBOL, TechnologyType.JCL, TechnologyType.STRUTS
        );

        // Every technology here has strong, multi-signal evidence, so all should saturate at 100.
        byType.values().forEach(detected -> assertThat(detected.getConfidenceScore()).isEqualTo(100));
        byType.values().forEach(detected -> assertThat(detected.getEvidence()).isNotEmpty());

        assertThat(result.getJavaVersion().getValue()).isEqualTo("17");
        assertThat(result.getDatabases()).extracting(DetectedAttribute::getValue).contains("MySQL");
        assertThat(result.getBuildTool().getValue()).isEqualTo("Maven");
        assertThat(result.getApplicationServer().getValue()).isEqualTo("Apache Tomcat");
    }

    @Test
    void reportsNoTechnologiesAndUnknownMetadataForAnEmptyProject() {
        TechnologyDetectionResult result = engine.detect("empty-project", projectDir.toString());

        assertThat(result.getDetectedTechnologies()).isEmpty();
        assertThat(result.getJavaVersion().getValue()).isEqualTo("Unknown");
        assertThat(result.getDatabases()).isEmpty();
        assertThat(result.getBuildTool().getValue()).isEqualTo("Unknown");
        assertThat(result.getApplicationServer().getValue()).isEqualTo("Unknown");
    }

    private void writeFixtureProject(Path root) throws IOException {
        write(root, "pom.xml", """
                <project>
                    <properties>
                        <maven.compiler.source>17</maven.compiler.source>
                    </properties>
                    <dependencies>
                        <dependency>
                            <groupId>mysql</groupId>
                            <artifactId>mysql-connector-java</artifactId>
                        </dependency>
                    </dependencies>
                </project>
                """);

        write(root, "web.xml", "<web-app><servlet></servlet></web-app>");
        write(root, "context.xml", "<Context>Catalina Tomcat context</Context>");

        write(root, "src/main/java/com/example/HomeServlet.java", """
                import javax.servlet.http.HttpServlet;
                @WebServlet("/home")
                public class HomeServlet extends HttpServlet {}
                """);

        write(root, "src/main/java/com/example/HomeController.java", """
                import org.springframework.web.bind.annotation.GetMapping;
                import org.springframework.web.bind.annotation.RestController;
                @RestController
                public class HomeController {
                    @GetMapping("/") public String home() { return "ok"; }
                }
                """);

        write(root, "web/index.jsp", "<%@ taglib uri=\"x\" prefix=\"c\" %>\n<% out.println(\"hi\"); %>");

        write(root, "src/main/java/com/example/CustomerEntity.java", """
                import org.hibernate.Session;
                import javax.persistence.Entity;
                @Entity
                public class CustomerEntity {}
                """);
        write(root, "hibernate.cfg.xml", "<hibernate-configuration></hibernate-configuration>");

        write(root, "src/main/java/com/example/BillingBean.java", """
                import javax.ejb.Stateless;
                @Stateless
                public class BillingBean {}
                """);
        write(root, "ejb-jar.xml", "<ejb-jar></ejb-jar>");

        write(root, "legacy/CUSTOMER.cbl", "IDENTIFICATION DIVISION.\nPROCEDURE DIVISION.\n");
        write(root, "legacy/BATCH.jcl", "//BATCHJOB JOB (ACCT),'RUN'\n//STEP1 EXEC PGM=SORT\n");

        write(root, "src/main/java/com/example/LoginAction.java", """
                import org.apache.struts.action.Action;
                public class LoginAction extends Action {}
                """);
        write(root, "struts-config.xml", "<struts-config></struts-config>");

        write(root, "applicationContext.xml", """
                <beans xmlns="http://www.springframework.org/schema/beans">
                </beans>
                """);

        write(root, "src/main/java/com/example/JdbcDao.java", """
                import java.sql.Connection;
                public class JdbcDao {
                    String url = "jdbc:mysql://localhost/db";
                }
                """);
        write(root, "src/main/resources/application.properties",
                "spring.datasource.url=jdbc:mysql://localhost/db\nspring.application.name=legacy-app\n");
    }

    private void write(Path root, String relativePath, String content) throws IOException {
        Path target = root.resolve(relativePath);
        Files.createDirectories(target.getParent());
        Files.writeString(target, content);
    }

}
