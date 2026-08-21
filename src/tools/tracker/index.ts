import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../../client/api-client.js";
import { registerCreateTaskTool } from "./create-task.js";

export function registerTrackerTools(
  server: McpServer,
  client: ApiClient,
): void {
  registerCreateTaskTool(server, client);
}
