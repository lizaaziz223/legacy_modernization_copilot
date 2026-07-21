import type { Project } from '@/types';

/**
 * ZIP magic numbers (the first 4 bytes) - checked instead of trusting the
 * file extension/MIME type alone, so a corrupted or mislabeled file is
 * rejected before wasting an upload round-trip.
 */
const ZIP_MAGIC_NUMBERS: number[][] = [
  [0x50, 0x4b, 0x03, 0x04], // standard
  [0x50, 0x4b, 0x05, 0x06], // empty archive
  [0x50, 0x4b, 0x07, 0x08], // spanned archive
];

export async function isLikelyZipFile(file: File): Promise<boolean> {
  const buffer = await file.slice(0, 4).arrayBuffer();
  const header = new Uint8Array(buffer);
  if (header.length < 4) return false;
  return ZIP_MAGIC_NUMBERS.some((magic) => magic.every((byte, index) => header[index] === byte));
}

/**
 * Flags a likely duplicate upload by comparing the selected file's name
 * against previously uploaded projects' original archive names - a
 * same-project re-upload is the common case this is meant to catch, not a
 * guarantee of true content equality.
 */
export function findDuplicateProject(projects: Project[], file: File): Project | null {
  const candidateName = file.name.trim().toLowerCase();
  return projects.find((project) => project.originalFileName.trim().toLowerCase() === candidateName) ?? null;
}
