import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../client/api-client.js";
import { registerRefreshSessionTool } from "./refresh-session.js";
import { registerTrackerTools } from "./tracker/index.js";

export function registerAllTools(
  server: McpServer,
  client: ApiClient,
): void {
  registerRefreshSessionTool(server, client);
  registerTrackerTools(server, client);
}
