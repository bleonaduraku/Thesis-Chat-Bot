import { prisma } from "@/lib/prisma";
import { ingestDocument } from "@/lib/ingest";
import type { Prisma } from "@/generated/prisma/client";
import { isAdminRequest, adminChallenge } from "@/lib/adminAuth";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return adminChallenge();
  try {
    const documents = await prisma.knowledgeDocument.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        metadata: true,
        createdAt: true,
        _count: { select: { chunks: true } },
      },
    });

    return Response.json({
      documents: documents.map((d) => ({
        id: d.id,
        title: d.title,
        preview: d.content.slice(0, 200),
        metadata: d.metadata,
        createdAt: d.createdAt,
        chunkCount: d._count.chunks,
      })),
    });
  } catch (err) {
    console.error("[api/documents] GET failed", err);
    return Response.json(
      { error: "Failed to load documents." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return adminChallenge();
  let body: { title?: unknown; content?: unknown; metadata?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { title, content, metadata } = body;
  if (typeof title !== "string" || !title.trim()) {
    return Response.json({ error: "`title` is required." }, { status: 400 });
  }
  if (typeof content !== "string" || !content.trim()) {
    return Response.json({ error: "`content` is required." }, { status: 400 });
  }

  try {
    const result = await ingestDocument(
      title.trim(),
      content,
      metadata && typeof metadata === "object"
        ? (metadata as Prisma.InputJsonObject)
        : undefined
    );
    return Response.json(result, { status: 201 });
  } catch (err) {
    console.error("[api/documents] ingestion failed", err);
    return Response.json(
      { error: "Failed to ingest document." },
      { status: 500 }
    );
  }
}
