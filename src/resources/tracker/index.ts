import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../../client/api-client.js";
import { registerMyTasksResource } from "./my-tasks.js";

export function registerTrackerResources(
  server: McpServer,
  client: ApiClient,
): void {
  registerMyTasksResource(server, client);
}
