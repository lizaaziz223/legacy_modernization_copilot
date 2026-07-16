package com.ailegacy.modernization.copilot.infrastructure.analysis;

import com.ailegacy.modernization.copilot.domain.entities.DetectedAttribute;
import com.ailegacy.modernization.copilot.infrastructure.analysis.model.ScannedFile;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Detects which relational databases a project targets, from JDBC connection
 * strings and known driver dependency names.
 */
@Component
public class DatabaseDetector {

    private static final Map<String, String> MARKERS = new LinkedHashMap<>();

    static {
        MARKERS.put("jdbc:mysql", "MySQL");
        MARKERS.put("mysql-connector", "MySQL");
        MARKERS.put("jdbc:postgresql", "PostgreSQL");
        MARKERS.put("org.postgresql", "PostgreSQL");
        MARKERS.put("jdbc:oracle", "Oracle");
        MARKERS.put("ojdbc", "Oracle");
        MARKERS.put("jdbc:sqlserver", "SQL Server");
        MARKERS.put("mssql-jdbc", "SQL Server");
        MARKERS.put("jdbc:h2", "H2");
        MARKERS.put("com.h2database", "H2");
        MARKERS.put("jdbc:db2", "DB2");
        MARKERS.put("db2jcc", "DB2");
        MARKERS.put("jdbc:sqlite", "SQLite");
    }

    public List<DetectedAttribute> detect(List<ScannedFile> files) {
        Map<String, List<String>> evidenceByDatabase = new LinkedHashMap<>();

        for (ScannedFile file : files) {
            for (Map.Entry<String, String> marker : MARKERS.entrySet()) {
                if (file.content().contains(marker.getKey())) {
                    evidenceByDatabase
                            .computeIfAbsent(marker.getValue(), k -> new ArrayList<>())
                            .add("\"" + marker.getKey() + "\" found in " + file.relativePath());
                }
            }
        }

        List<DetectedAttribute> results = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();
        for (Map.Entry<String, List<String>> entry : evidenceByDatabase.entrySet()) {
            if (!seen.add(entry.getKey())) {
                continue;
            }
            List<String> evidence = entry.getValue().size() > 5 ? entry.getValue().subList(0, 5) : entry.getValue();
            results.add(DetectedAttribute.builder()
                    .value(entry.getKey())
                    .confidenceScore(Math.min(100, 60 + entry.getValue().size() * 10))
                    .evidence(List.copyOf(evidence))
                    .build());
        }
        return results;
    }

}
