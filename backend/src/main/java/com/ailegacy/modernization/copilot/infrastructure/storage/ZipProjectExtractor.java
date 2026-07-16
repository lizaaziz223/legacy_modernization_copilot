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
import java.util.Arrays;
import java.util.HashSet;
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
        if (originalFilename == null || !originalFilename.toLowerCase(Locale.ROOT).endsWith(".zip")) {
            throw new ValidationException("Only ZIP archives are supported");
        }

        Path projectDir = baseDirectory.resolve(projectId).normalize();

        long totalSize = 0;
        long totalFiles = 0;
        Map<String, Long> breakdown = new TreeMap<>();
        Set<String> directories = new HashSet<>();

        try {
            Files.createDirectories(projectDir);

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

                    Path parent = resolved.getParent();
                    if (!parent.equals(projectDir)) {
                        directories.add(projectDir.relativize(parent).toString());
                    }

                    Files.createDirectories(parent);
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

            log.info("Project archive extracted | projectId={} | files={} | folders={} | sizeBytes={}",
                    projectId, totalFiles, directories.size(), totalSize);
            return new ExtractionResult(projectDir.toString(), totalFiles, directories.size(), totalSize, breakdown);

        } catch (IOException ex) {
            FileSystemUtils.deleteRecursively(projectDir.toFile());
            log.error("Failed to extract project archive | projectId={}", projectId, ex);
            throw new ValidationException("Failed to read the uploaded archive: " + ex.getMessage(), ex);
        } catch (ValidationException ex) {
            FileSystemUtils.deleteRecursively(projectDir.toFile());
            throw ex;
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
