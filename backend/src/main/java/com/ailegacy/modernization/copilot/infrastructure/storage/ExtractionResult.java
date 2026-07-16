package com.ailegacy.modernization.copilot.infrastructure.storage;

import java.util.Map;

/**
 * Result of extracting a project archive: where it landed on disk and the
 * computed totals used to build the project summary.
 */
public record ExtractionResult(
        String storagePath,
        String originalZipPath,
        long totalFiles,
        long totalSizeBytes,
        Map<String, Long> fileExtensionBreakdown
) {
}
