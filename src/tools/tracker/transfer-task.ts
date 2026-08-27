import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient } from "../../client/api-client.js";
import { toTaskOutput, type RawTask } from "../../resources/tracker/task-dto.js";

const INVERSE_STATUS_MAP: Record<string, number> = {
  New: 1,
  Develop: 2,
  "Code Review": 4,
  QA: 6,
  Done: 8,
};

export function registerTransferTaskTool(
  server: McpServer,
  client: ApiClient,
): void {
  server.tool(
    "tracker_transfer_task",
    "Перевести задачу в новый статус и/или назначить исполнителя",
    {
      projectId: z.number().describe("ID проекта"),
      taskId: z.number().describe("ID задачи"),
      performerId: z
        .number()
        .describe("ID нового исполнителя (0 = без исполнителя)"),
      status: z
        .enum(["New", "Develop", "Code Review", "QA", "Done"])
        .describe("Новый статус задачи"),
    },
    async ({ projectId, taskId, performerId, status }) => {
      const statusId = INVERSE_STATUS_MAP[status];

      const result = await client.put(
        `/api/v1/project/${projectId}/task/${taskId}`,
        { id: taskId, performerId, statusId },
      );

      const raw = (Array.isArray(result) ? result[0] : result) as RawTask;
      const output = toTaskOutput(raw);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(output, null, 2),
          },
        ],
      };
    },
  );
}
