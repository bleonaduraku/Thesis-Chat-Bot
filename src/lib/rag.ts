import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { genai, EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from "@/lib/ai";

/**
 * pgvector has no first-class Prisma scalar type (the `vector` column is
 * declared `Unsupported("vector(1536)")` in schema.prisma), so all reads and
 * writes against it go through raw SQL. A JS number[] is serialized to
 * pgvector's bracketed text literal ("[0.1,0.2,...]") and cast with `::vector`.
 */
function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

export async function embedText(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text]);
  return embedding;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const response = await genai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: texts,
    config: { outputDimensionality: EMBEDDING_DIMENSIONS },
  });
  const embeddings = response.embeddings;
  if (!embeddings || embeddings.length !== texts.length) {
    throw new Error(
      `Embedding request returned ${embeddings?.length ?? 0} vectors for ${texts.length} inputs.`
    );
  }
  return embeddings.map((e) => {
    if (!e.values) throw new Error("Embedding response missing `values`.");
    return e.values;
  });
}

export async function storeChunkEmbedding(
  chunkId: string,
  embedding: number[]
): Promise<void> {
  const vectorLiteral = toVectorLiteral(embedding);
  await prisma.$executeRaw`
    INSERT INTO embeddings (id, "chunkId", vector, model, "createdAt")
    VALUES (${randomUUID()}, ${chunkId}, ${vectorLiteral}::vector, ${EMBEDDING_MODEL}, now())
    ON CONFLICT ("chunkId") DO UPDATE
      SET vector = EXCLUDED.vector,
          model = EXCLUDED.model
  `;
}

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  content: string;
  similarity: number;
}

/**
 * Cosine-similarity search over document_chunks via pgvector's `<=>`
 * (cosine distance) operator. `1 - distance` converts distance to a
 * similarity score in roughly [0, 1] (can dip slightly negative for
 * near-opposite vectors, which is fine - we only use it for ranking/display).
 */
export async function searchSimilarChunks(
  queryEmbedding: number[],
  topK = 5
): Promise<RetrievedChunk[]> {
  const vectorLiteral = toVectorLiteral(queryEmbedding);
  const rows = await prisma.$queryRaw<
    Array<{
      chunkId: string;
      documentId: string;
      documentTitle: string;
      content: string;
      similarity: number;
    }>
  >`
    SELECT
      dc.id AS "chunkId",
      dc."documentId" AS "documentId",
      kd.title AS "documentTitle",
      dc.content AS content,
      1 - (e.vector <=> ${vectorLiteral}::vector) AS similarity
    FROM embeddings e
    JOIN document_chunks dc ON dc.id = e."chunkId"
    JOIN knowledge_documents kd ON kd.id = dc."documentId"
    ORDER BY e.vector <=> ${vectorLiteral}::vector ASC
    LIMIT ${topK}
  `;
  return rows;
}

/** Formats retrieved chunks into a labeled context block for the LLM prompt. */
export function buildContextBlock(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";
  return chunks
    .map(
      (c, i) =>
        `[${i + 1}] Burimi: "${c.documentTitle}"\n${c.content.trim()}`
    )
    .join("\n\n");
}
