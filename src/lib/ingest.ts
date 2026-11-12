import { prisma } from "@/lib/prisma";
import { chunkText } from "@/lib/chunk";
import { embedTexts, storeChunkEmbedding } from "@/lib/rag";
import type { Prisma } from "@/generated/prisma/client";

export interface IngestResult {
  documentId: string;
  chunkCount: number;
}

/**
 * Full ingestion pipeline for one knowledge document: persist the document,
 * split it into chunks, embed all chunks in one batched OpenAI call, then
 * store each chunk + its embedding. Shared by the /api/documents route and
 * the seed script so both paths behave identically.
 */
export async function ingestDocument(
  title: string,
  content: string,
  metadata?: Prisma.InputJsonValue
): Promise<IngestResult> {
  const document = await prisma.knowledgeDocument.create({
    data: { title, content, metadata },
  });

  const pieces = chunkText(content);
  if (pieces.length === 0) {
    return { documentId: document.id, chunkCount: 0 };
  }

  const embeddings = await embedTexts(pieces);

  for (let i = 0; i < pieces.length; i++) {
    const chunk = await prisma.documentChunk.create({
      data: {
        documentId: document.id,
        chunkIndex: i,
        content: pieces[i],
      },
    });
    await storeChunkEmbedding(chunk.id, embeddings[i]);
  }

  return { documentId: document.id, chunkCount: pieces.length };
}
