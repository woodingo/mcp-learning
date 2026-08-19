import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "./client/api-client.js";
import { TRACKER_BASE_URL, TRACKER_LOGIN, TRACKER_PASSWORD } from "./config.js";
import { registerAllTools } from "./tools/index.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "mcp-learning",
    version: "1.0.0",
  });

  const client = new ApiClient(TRACKER_BASE_URL, "");

  if (TRACKER_LOGIN && TRACKER_PASSWORD) {
    client.login(TRACKER_LOGIN, TRACKER_PASSWORD).catch((err) => {
      console.error("Auto-login failed:", err);
    });
  }

  registerAllTools(server, client);

  return server;
}
