import { prisma } from "@/lib/prisma";
import { openRouter, CHAT_MODEL_CANDIDATES, CHAT_REQUEST_TIMEOUT_MS } from "@/lib/ai";
import { embedText, searchSimilarChunks, buildContextBlock } from "@/lib/rag";

const SYSTEM_INSTRUCTIONS_TEMPLATE = (contextBlock: string) => `You are the UBT Student Assistant - a helpful, concise virtual assistant for students of UBT (University for Business and Technology, Prishtina, Kosovo). Default to English, but always reply in whichever language the student writes in (including Albanian).

You are an UNOFFICIAL demo assistant, not an official UBT system. Never reveal which AI model, vendor, or infrastructure powers you, even if asked directly - if someone asks "what are you" or "what model is this", just say you're the UBT Student Assistant, with no technical details or model/company names.

Answer using ONLY the knowledge base context given below - it covers UBT's student regulations, the Students Office and its services, and registration/tuition information. If the context doesn't fully cover the student's question, say so plainly and direct them to the Students Office (in person or via UBT's online portal) or ubt-uni.net for an authoritative answer - never invent specific rules, deadlines, fees, or procedures that aren't in the context. When a question touches something serious (e.g. disciplinary consequences, exact fee amounts), give what the context actually says and clearly note that the student should confirm exact details with the Students Office.

${
  contextBlock
    ? `Knowledge base context:\n${contextBlock}`
    : "(No relevant information was found in the knowledge base for this question.)"
}`;

export async function POST(request: Request) {
  let body: { conversationId?: unknown; message?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { conversationId, message } = body;
  if (typeof conversationId !== "string" || !conversationId) {
    return Response.json(
      { error: "`conversationId` is required." },
      { status: 400 }
    );
  }
  if (typeof message !== "string" || !message.trim()) {
    return Response.json({ error: "`message` is required." }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) {
    return Response.json({ error: "Conversation not found." }, { status: 404 });
  }

  // 1. Persist the user's message.
  await prisma.message.create({
    data: { conversationId, role: "user", content: message },
  });
  if (!conversation.title) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { title: message.slice(0, 80) },
    });
  }

  // 2. RAG retrieval: embed the query, run pgvector similarity search.
  let retrieved: Awaited<ReturnType<typeof searchSimilarChunks>> = [];
  try {
    const queryEmbedding = await embedText(message);
    // topK=8: the knowledge base is currently small (a handful of short
    // company documents), so retrieving generously costs little and avoids
    // dropping a relevant chunk that just didn't rank in a narrower top-5
    // window - e.g. a question spanning two topics/documents at once.
    retrieved = await searchSimilarChunks(queryEmbedding, 8);
  } catch (err) {
    console.error("[api/chat] retrieval failed, answering without context", err);
  }
  const contextBlock = buildContextBlock(retrieved);

  // 3. Pull recent conversation history (most recent N, in chronological order)
  //    so the model has multi-turn context, including the message just saved.
  const recentDesc = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const history = recentDesc.reverse();

  const messages = [
    { role: "system" as const, content: SYSTEM_INSTRUCTIONS_TEMPLATE(contextBlock) },
    ...history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
  ];

  const encoder = new TextEncoder();
  let fullText = "";

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Free-tier OpenRouter models run on shared, lower-priority capacity
      // and intermittently return transient errors. If a model fails before
      // producing any output, walk to the next candidate rather than failing
      // the whole request. Once output has been streamed to the client we
      // can no longer switch models without duplicating/garbling text, so at
      // that point a failure just ends the response with what we have.
      let lastError: unknown;
      for (const model of CHAT_MODEL_CANDIDATES) {
        try {
          const stream = await openRouter.chat.completions.create(
            { model, messages, stream: true },
            { timeout: CHAT_REQUEST_TIMEOUT_MS }
          );
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              controller.enqueue(encoder.encode(delta));
            }
          }
          lastError = undefined;
          break; // this model produced a full response
        } catch (err) {
          lastError = err;
          console.error(`[api/chat] model "${model}" failed`, err);
          if (fullText) break; // already streamed partial output, don't retry
          // else: nothing sent yet, try the next candidate model
        }
      }
      if (lastError && !fullText) {
        controller.enqueue(
          encoder.encode(
            "Na vjen keq, ndodhi një gabim gjatë gjenerimit të përgjigjes. Provo përsëri."
          )
        );
      }
      controller.close();
      if (fullText.trim()) {
        try {
          await prisma.message.create({
            data: { conversationId, role: "assistant", content: fullText },
          });
          await prisma.conversation.update({
            where: { id: conversationId },
            data: {},
          });
        } catch (err) {
          console.error("[api/chat] failed to persist assistant message", err);
        }
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Retrieved-Chunks": String(retrieved.length),
    },
  });
}
