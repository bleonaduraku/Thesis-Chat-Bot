import { prisma } from "@/lib/prisma";
import { getOrCreateDemoUser } from "@/lib/demoUser";

export async function POST(request: Request) {
  let title: string | undefined;
  try {
    const body = await request.json();
    if (typeof body?.title === "string") title = body.title;
  } catch {
    // no body / not JSON - fine, title is optional
  }

  try {
    const user = await getOrCreateDemoUser();
    const conversation = await prisma.conversation.create({
      data: { userId: user.id, title },
    });
    return Response.json({ conversation }, { status: 201 });
  } catch (err) {
    console.error("[api/conversations] POST failed", err);
    return Response.json(
      { error: "Failed to create conversation." },
      { status: 500 }
    );
  }
}

// There is deliberately no GET handler listing conversations: every visitor
// shares the same demo user, so a list endpoint would expose all students'
// chats. A conversation can only be read by its unguessable UUID, which only
// the browser that created it knows (kept in its localStorage).
