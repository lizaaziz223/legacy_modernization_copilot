package com.ailegacy.modernization.copilot.infrastructure.analysis;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

/**
 * Reads a compiled {@code .class} file's major version directly from its
 * binary header (bytes 6-7, big-endian, right after the 0xCAFEBABE magic
 * number and the 2-byte minor version) - a hard fact about the bytecode,
 * unlike source-level heuristics.
 *
 * Class files are binary, so this reads raw bytes straight off disk rather
 * than going through {@link ProjectFileScanner}'s UTF-8 {@code ScannedFile}
 * pipeline, which would corrupt (and typically fail to decode) them.
 */
@Slf4j
@Component
public class ClassFileVersionReader {

    private static final int MAGIC = 0xCAFEBABE;

    private static final Map<Integer, String> MAJOR_VERSION_TO_JAVA = Map.ofEntries(
            Map.entry(45, "1.1"), Map.entry(46, "1.2"), Map.entry(47, "1.3"), Map.entry(48, "1.4"),
            Map.entry(49, "5"), Map.entry(50, "6"), Map.entry(51, "7"), Map.entry(52, "8"),
            Map.entry(53, "9"), Map.entry(54, "10"), Map.entry(55, "11"), Map.entry(56, "12"),
            Map.entry(57, "13"), Map.entry(58, "14"), Map.entry(59, "15"), Map.entry(60, "16"),
            Map.entry(61, "17"), Map.entry(62, "18"), Map.entry(63, "19"), Map.entry(64, "20"),
            Map.entry(65, "21"), Map.entry(66, "22"), Map.entry(67, "23"), Map.entry(68, "24")
    );

    /**
     * Finds the first readable {@code .class} file under {@code storagePath} and returns
     * its bytecode major version plus the mapped Java release, or empty if none is found.
     */
    public Optional<ClassFileVersion> detect(String storagePath) {
        Path root = Path.of(storagePath);
        if (!Files.isDirectory(root)) {
            return Optional.empty();
        }

        try (Stream<Path> walk = Files.walk(root)) {
            return walk
                    .filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().toLowerCase().endsWith(".class"))
                    .map(this::readMajorVersion)
                    .flatMap(Optional::stream)
                    .findFirst();
        } catch (IOException ex) {
            log.warn("Failed to walk project files for .class bytecode detection | path={}", storagePath, ex);
            return Optional.empty();
        }
    }

    private Optional<ClassFileVersion> readMajorVersion(Path classFile) {
        try (InputStream in = Files.newInputStream(classFile)) {
            byte[] header = in.readNBytes(8);
            if (header.length < 8) {
                return Optional.empty();
            }
            int magic = ((header[0] & 0xFF) << 24) | ((header[1] & 0xFF) << 16)
                    | ((header[2] & 0xFF) << 8) | (header[3] & 0xFF);
            if (magic != MAGIC) {
                return Optional.empty();
            }
            int major = ((header[6] & 0xFF) << 8) | (header[7] & 0xFF);
            String javaRelease = MAJOR_VERSION_TO_JAVA.get(major);
            if (javaRelease == null) {
                return Optional.empty();
            }
            return Optional.of(new ClassFileVersion(major, javaRelease, classFile.getFileName().toString()));
        } catch (IOException ex) {
            log.warn("Skipping unreadable .class file during bytecode version detection | file={}", classFile, ex);
            return Optional.empty();
        }
    }

    public record ClassFileVersion(int majorVersion, String javaRelease, String fileName) {
    }

}
