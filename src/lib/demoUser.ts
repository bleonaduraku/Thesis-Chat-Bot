import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@chatbot.local";

/**
 * This app has no authentication layer (out of scope for the thesis demo).
 * All conversations are attached to a single well-known "demo" user so the
 * User -> Conversation -> Message relation chain from the data model is
 * still fully exercised end-to-end.
 */
export async function getOrCreateDemoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: { email: DEMO_USER_EMAIL, name: "Demo User" },
  });
}
