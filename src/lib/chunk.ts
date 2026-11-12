/**
 * Splits document text into overlapping word-based chunks suitable for
 * embedding + vector search. Overlap keeps context from being severed right
 * at a chunk boundary (a sentence that straddles two chunks still appears,
 * roughly, in both).
 */
export function chunkText(
  text: string,
  options: { chunkSize?: number; overlap?: number } = {}
): string[] {
  const chunkSize = options.chunkSize ?? 220; // ~ words per chunk
  const overlap = options.overlap ?? 40; // ~ words shared between consecutive chunks

  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const words = normalized.split(/\s+/);
  if (words.length <= chunkSize) {
    return [normalized];
  }

  const chunks: string[] = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    chunks.push(words.slice(start, end).join(" "));
    if (end === words.length) break;
    start = end - overlap;
  }
  return chunks;
}
