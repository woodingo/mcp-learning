import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "./client/api-client.js";
import { TRACKER_BASE_URL, TRACKER_LOGIN, TRACKER_PASSWORD } from "./config.js";
import { registerAllTools } from "./tools/index.js";
import { registerAllResources } from "./resources/index.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "mcp-learning",
    version: "1.0.0",
  });

  const client = new ApiClient(TRACKER_BASE_URL, "");

  if (TRACKER_LOGIN && TRACKER_PASSWORD) {
    client.setCredentials(TRACKER_LOGIN, TRACKER_PASSWORD);
  }

  registerAllTools(server, client);
  registerAllResources(server, client);

  return server;
}
