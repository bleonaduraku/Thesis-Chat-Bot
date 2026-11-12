# UBT Student Assistant

An AI chatbot that answers student questions about UBT (University for Business and Technology, Prishtina, Kosovo), built for a Bachelor's thesis. It uses **Retrieval-Augmented Generation (RAG)**: every answer is grounded in a knowledge base of UBT documents rather than the language model's general knowledge.

> Unofficial demo, not an official UBT service. Information may be incomplete or out of date; confirm details with the UBT Students Office or [ubt-uni.net](https://www.ubt-uni.net).

## Features

- Chat widget with answers streamed word by word, in English or Albanian
- RAG pipeline: Gemini embeddings, pgvector similarity search, and answer generation through OpenRouter's free models, with automatic fallback across five models
- Password-protected admin page (`/knowledge`) for adding and deleting knowledge base documents
- Conversation history kept per browser
- Answers rendered as Markdown (bold text, lists, tables, links)

## How it works

1. **Ingestion:** each document is split into chunks of about 220 words, with a 40-word overlap, and every chunk is embedded with `gemini-embedding-001` (1,536 dimensions).
2. **Retrieval:** a question is embedded the same way, and the 8 most similar chunks are found with pgvector's cosine distance.
3. **Generation:** the chunks are placed in the system prompt with the last 20 messages of the conversation, and the model streams an answer based only on that context.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Prisma 6 with `@prisma/adapter-pg` · PostgreSQL with pgvector (Supabase) · Gemini API · OpenRouter

## Getting started

Requirements: Node.js 20 or newer, a Supabase project, and free API keys from [Google AI Studio](https://aistudio.google.com/apikey) and [OpenRouter](https://openrouter.ai/keys).

```bash
npm install
cp .env.example .env    # then fill in the values
npx prisma db push      # create the tables
npm run db:seed         # load the starter UBT documents
npm run dev
```

Open <http://localhost:3000>. The admin page is <http://localhost:3000/knowledge> (username `admin`, password from `ADMIN_PASSWORD`).

### Running without Supabase

`local-db/` contains an embedded PostgreSQL server (PGlite) with pgvector:

```bash
cd local-db && npm install && cd ..
node local-db/server.js    # PostgreSQL on 127.0.0.1:5433
```

Set both `DATABASE_URL` and `DIRECT_URL` to `postgresql://postgres:postgres@127.0.0.1:5433/postgres?sslmode=disable`, then create the tables with `npx prisma db push --schema local-db/schema.local.prisma`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection used by the app (Supabase transaction pooler) |
| `DIRECT_URL` | Direct connection used by Prisma for schema changes (Supabase session pooler) |
| `GEMINI_API_KEY` | Embeddings |
| `OPENROUTER_API_KEY` | Answer generation |
| `ADMIN_PASSWORD` | Password for `/knowledge` (username `admin`); without it the page stays locked |

Optional: `OPENROUTER_CHAT_MODEL`, `OPENROUTER_CHAT_MODELS` (comma-separated fallback list) and `GEMINI_EMBEDDING_MODEL`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the code |
| `npm run db:seed` | Load the starter UBT documents |
| `npm run db:studio` | Open Prisma Studio to browse the database |
