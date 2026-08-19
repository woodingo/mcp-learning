import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../../client/api-client.js";
import { registerTrackerListProjects } from "./list-projects.js";
import { registerTrackerGetProject } from "./get-project.js";
import { registerTrackerListTasks } from "./list-tasks.js";

export function registerTrackerTools(
  server: McpServer,
  client: ApiClient,
): void {
  registerTrackerListProjects(server, client);
  registerTrackerGetProject(server, client);
  registerTrackerListTasks(server, client);
}
