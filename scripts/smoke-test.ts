import "dotenv/config";
import { genai, openRouter, CHAT_MODEL, EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from "../src/lib/ai";

async function main() {
  console.log(`Testing embeddings with model "${EMBEDDING_MODEL}" (Gemini)...`);
  const embedRes = await genai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: ["Sa zgjat dërgesa?"],
    config: { outputDimensionality: EMBEDDING_DIMENSIONS },
  });
  const vec = embedRes.embeddings?.[0]?.values;
  console.log(`  -> got vector of length ${vec?.length}`);

  console.log(`Testing chat streaming with model "${CHAT_MODEL}" (Groq)...`);
  const stream = await openRouter.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: "You are a terse test assistant." },
      { role: "user", content: "Say hello in one short sentence." },
    ],
    stream: true,
  });
  let full = "";
  for await (const chunk of stream) {
    full += chunk.choices[0]?.delta?.content ?? "";
  }
  console.log(`  -> got response: "${full.trim()}"`);
  console.log("Smoke test passed.");
}

main().catch((err) => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});
