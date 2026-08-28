import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../../client/api-client.js";
import { registerCreateTaskTool } from "./create-task.js";
import { registerGetTaskTool } from "./get-task.js";
import { registerGetTimesheetsMyTool } from "./get-timesheets-my.js";
import { registerLogTimeTool } from "./log-time.js";
import { registerTransferTaskTool } from "./transfer-task.js";

export function registerTrackerTools(
  server: McpServer,
  client: ApiClient,
): void {
  registerCreateTaskTool(server, client);
  registerGetTaskTool(server, client);
  registerGetTimesheetsMyTool(server, client);
  registerLogTimeTool(server, client);
  registerTransferTaskTool(server, client);
}
