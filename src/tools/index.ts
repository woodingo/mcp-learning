import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../client/api-client.js";
import { registerGetCurrentTimeTool } from "./get-current-time.js";
import { registerTrackerTools } from "./tracker/index.js";

export function registerAllTools(
  server: McpServer,
  client: ApiClient,
): void {
  registerGetCurrentTimeTool(server);
  registerTrackerTools(server, client);
}
