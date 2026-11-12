// Local Postgres (PGlite + pgvector) for running the app on this PC without
// Supabase. Data is stored in ./data. Start with: node local-db/server.js
import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { uuid_ossp } from "@electric-sql/pglite/contrib/uuid_ossp";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { fileURLToPath } from "node:url";

const dataDir = fileURLToPath(new URL("./data", import.meta.url));
const port = Number(process.env.LOCAL_DB_PORT ?? 5433);

const db = await PGlite.create({
  dataDir,
  extensions: { vector, pgcrypto, uuid_ossp },
});
await db.exec("CREATE EXTENSION IF NOT EXISTS vector;");

const server = new PGLiteSocketServer({
  db,
  port,
  host: "127.0.0.1",
  maxConnections: 20,
});
await server.start();
console.log(`Local Postgres ready on 127.0.0.1:${port} (data: ${dataDir})`);

const shutdown = async () => {
  await server.stop();
  await db.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
