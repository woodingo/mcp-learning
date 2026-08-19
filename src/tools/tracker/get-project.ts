import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient } from "../../client/api-client.js";

export function registerTrackerGetProject(
  server: McpServer,
  client: ApiClient,
): void {
  server.tool(
    "tracker_get_project",
    "Get project details by ID from the task tracker",
    {
      projectId: z.number().describe("Project ID"),
    },
    async ({ projectId }) => {
      const result = await client.get(`/api/v1/project/${projectId}`);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );
}
