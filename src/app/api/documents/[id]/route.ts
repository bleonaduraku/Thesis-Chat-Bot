import { prisma } from "@/lib/prisma";
import { isAdminRequest, adminChallenge } from "@/lib/adminAuth";

export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/documents/[id]">
) {
  if (!isAdminRequest(request)) return adminChallenge();
  const { id } = await ctx.params;

  try {
    // onDelete: Cascade on DocumentChunk -> KnowledgeDocument and
    // Embedding -> DocumentChunk removes chunks + embeddings automatically.
    await prisma.knowledgeDocument.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[api/documents/:id] delete failed", err);
    return Response.json(
      { error: "Document not found or could not be deleted." },
      { status: 404 }
    );
  }
}
