import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient } from "../../client/api-client.js";

export function registerTrackerListProjects(
  server: McpServer,
  client: ApiClient,
): void {
  server.tool(
    "tracker_list_projects",
    "List projects from the task tracker",
    {
      name: z.string().optional().describe("Filter by project name"),
      pageSize: z.number().optional().describe("Page size (default: 20)"),
      currentPage: z.number().optional().describe("Page number (default: 1)"),
      fields: z
        .string()
        .optional()
        .describe('Comma-separated fields (default: "name,statusId,createdAt")'),
    },
    async ({ name, pageSize, currentPage, fields }) => {
      const params = new URLSearchParams();
      if (name !== undefined) params.set("name", name);
      if (pageSize !== undefined) params.set("pageSize", String(pageSize));
      if (currentPage !== undefined)
        params.set("currentPage", String(currentPage));
      if (fields !== undefined) params.set("fields", fields);

      const qs = params.toString();
      const path = `/api/v1/project${qs ? `?${qs}` : ""}`;
      const result = await client.get(path);

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
