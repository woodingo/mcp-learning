import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient } from "../../client/api-client.js";

const DEFAULT_FIELDS =
  "factExecutionTime,plannedExecutionTime,id,name,prioritiesId,projectId,sprintId,statusId,typeId,prefix";

export function registerTrackerListTasks(
  server: McpServer,
  client: ApiClient,
): void {
  server.tool(
    "tracker_list_tasks",
    "List tasks from the task tracker",
    {
      projectId: z.number().optional().describe("Filter by project ID"),
      isOnlyMine: z
        .boolean()
        .optional()
        .describe("Show only my tasks (default: false)"),
      queryId: z
        .string()
        .optional()
        .describe("Saved query/filter ID from the tracker"),
      currentPage: z.number().optional().describe("Page number (default: 0)"),
      pageSize: z.number().optional().describe("Page size (default: 20)"),
      fields: z
        .string()
        .optional()
        .describe(`Comma-separated fields (default: "${DEFAULT_FIELDS}")`),
    },
    async ({ projectId, isOnlyMine, queryId, currentPage, pageSize, fields }) => {
      const params = new URLSearchParams();
      if (currentPage !== undefined)
        params.set("currentPage", String(currentPage));
      if (isOnlyMine !== undefined) params.set("isOnlyMine", String(isOnlyMine));
      if (queryId !== undefined) params.set("queryId", queryId);
      if (projectId !== undefined) params.set("projectId", String(projectId));
      if (pageSize !== undefined) params.set("pageSize", String(pageSize));
      params.set("fields", fields ?? DEFAULT_FIELDS);

      const qs = params.toString();
      const path = `/api/v1/task?${qs}`;
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
