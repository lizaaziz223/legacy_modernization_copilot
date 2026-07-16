package com.ailegacy.modernization.copilot.application.use_cases.project;

/**
 * The original uploaded archive's bytes, ready for download.
 */
public record OriginalZipFile(byte[] content, String suggestedFilename) {
}
