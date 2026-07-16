package com.ailegacy.modernization.copilot.infrastructure.storage;

import com.ailegacy.modernization.copilot.domain.exceptions.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Extracts an uploaded ZIP archive, keeping only files with a supported
 * extension and discarding everything else.
 *
 * Guards against zip-slip (entries that would write outside the target
 * directory) and against decompression bombs (a hard cap on total extracted
 * size).
 */
@Slf4j
@Component
public class ZipProjectExtractor {

    private static final String PROJECTS_SUBDIRECTORY = "projects";
    private static final String ZIP_SUFFIX = ".zip";

    private final Set<String> supportedExtensions;
    private final Path baseDirectory;
    private final long maxExtractedSizeBytes;

    public ZipProjectExtractor(
            @Value("${app.temp-directory}") String tempDirectory,
            @Value("${app.project.supported-extensions:java,jsp,xml,properties,sql,yaml,yml,cbl,jcl}") String supportedExtensionsCsv,
            @Value("${app.project.max-extracted-size-mb:2000}") long maxExtractedSizeMb
    ) {
        this.baseDirectory = Paths.get(tempDirectory, PROJECTS_SUBDIRECTORY);
        this.supportedExtensions = Arrays.stream(supportedExtensionsCsv.split(","))
                .map(String::trim)
                .map(ext -> ext.toLowerCase(Locale.ROOT))
                .filter(ext -> !ext.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
        this.maxExtractedSizeBytes = maxExtractedSizeMb * 1024 * 1024;
    }

    public Set<String> getSupportedExtensions() {
        return supportedExtensions;
    }

    /**
     * Extract {@code zipFile} into a directory dedicated to {@code projectId}.
     */
    public ExtractionResult extract(MultipartFile zipFile, String projectId) {
        if (zipFile == null || zipFile.isEmpty()) {
            throw new ValidationException("A ZIP file is required");
        }

        String originalFilename = zipFile.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase(Locale.ROOT).endsWith(ZIP_SUFFIX)) {
            throw new ValidationException("Only ZIP archives are supported");
        }

        Path projectDir = baseDirectory.resolve(projectId).normalize();
        Path originalZipPath = baseDirectory.resolve(projectId + ZIP_SUFFIX).normalize();

        long totalSize = 0;
        long totalFiles = 0;
        Map<String, Long> breakdown = new TreeMap<>();

        try {
            Files.createDirectories(projectDir);

            // Persisted separately from extraction so the original archive can be
            // re-downloaded later - extraction below only keeps files with a
            // supported extension, discarding everything else from the archive.
            try (var rawInputStream = zipFile.getInputStream()) {
                Files.copy(rawInputStream, originalZipPath, StandardCopyOption.REPLACE_EXISTING);
            }

            try (ZipInputStream zis = new ZipInputStream(zipFile.getInputStream())) {
                ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    if (entry.isDirectory()) {
                        zis.closeEntry();
                        continue;
                    }

                    String extension = extensionOf(entry.getName());
                    if (!supportedExtensions.contains(extension)) {
                        zis.closeEntry();
                        continue;
                    }

                    Path resolved = projectDir.resolve(entry.getName()).normalize();
                    if (!resolved.startsWith(projectDir)) {
                        log.warn("Rejected zip entry escaping target directory | entry={}", entry.getName());
                        zis.closeEntry();
                        continue;
                    }

                    Files.createDirectories(resolved.getParent());
                    long bytesWritten;
                    try (OutputStream out = Files.newOutputStream(resolved)) {
                        bytesWritten = zis.transferTo(out);
                    }

                    totalSize += bytesWritten;
                    totalFiles++;
                    breakdown.merge(extension, 1L, Long::sum);
                    zis.closeEntry();

                    if (totalSize > maxExtractedSizeBytes) {
                        throw new ValidationException(
                                "Extracted project exceeds the maximum allowed size of " + (maxExtractedSizeBytes / (1024 * 1024)) + "MB"
                        );
                    }
                }
            }

            if (totalFiles == 0) {
                throw new ValidationException(
                        "No supported files found in the uploaded archive. Supported extensions: " + supportedExtensions
                );
            }

            log.info("Project archive extracted | projectId={} | files={} | sizeBytes={}", projectId, totalFiles, totalSize);
            return new ExtractionResult(projectDir.toString(), originalZipPath.toString(), totalFiles, totalSize, breakdown);

        } catch (IOException ex) {
            FileSystemUtils.deleteRecursively(projectDir.toFile());
            deleteQuietly(originalZipPath);
            log.error("Failed to extract project archive | projectId={}", projectId, ex);
            throw new ValidationException("Failed to read the uploaded archive: " + ex.getMessage(), ex);
        } catch (ValidationException ex) {
            FileSystemUtils.deleteRecursively(projectDir.toFile());
            deleteQuietly(originalZipPath);
            throw ex;
        }
    }

    private void deleteQuietly(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException ex) {
            log.warn("Failed to clean up {} after a failed upload", path, ex);
        }
    }

    private String extensionOf(String entryName) {
        String fileName = entryName.substring(entryName.lastIndexOf('/') + 1);
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex <= 0 || dotIndex == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }

}
