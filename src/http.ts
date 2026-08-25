import express from "express";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./server.js";
import { MCP_API_KEY, MCP_PORT, MCP_HOST } from "./config.js";

const app = express();
app.use(express.json());

if (MCP_API_KEY) {
  app.use("/mcp", (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid Authorization header" });
      return;
    }
    const token = auth.slice(7);
    if (token !== MCP_API_KEY) {
      res.status(403).json({ error: "Invalid API key" });
      return;
    }
    next();
  });
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const sessions = new Map<string, StreamableHTTPServerTransport>();

app.all("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (sessionId && sessions.has(sessionId)) {
    const transport = sessions.get(sessionId)!;
    await transport.handleRequest(req, res, req.body);
    return;
  }

  if (req.method === "POST" && req.body?.method === "initialize") {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => {
        sessions.set(id, transport);
      },
      onsessionclosed: (id) => {
        sessions.delete(id);
      },
    });
    const server = createServer();
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    return;
  }

  res.status(400).json({ error: "Bad request: missing or invalid session" });
});

function shutdown() {
  console.log("\nShutting down...");
  for (const [id, transport] of sessions) {
    transport.close().catch(() => {});
    sessions.delete(id);
  }
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

app.listen(MCP_PORT, MCP_HOST, () => {
  const authMode = MCP_API_KEY ? "API key auth" : "no auth (dev mode)";
  console.log(`MCP HTTP server listening on ${MCP_HOST}:${MCP_PORT} (${authMode})`);
});
