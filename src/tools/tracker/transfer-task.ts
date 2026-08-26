import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient } from "../../client/api-client.js";

const STATUS_MAP: Record<string, number> = {
  New: 1,
  Develop: 2,
  "Code Review": 4,
  QA: 6,
  Done: 8,
};

interface TaskResponse {
  id: number;
  name: string;
  statusId?: number;
  performer?: { id: number; fullNameRu?: string } | null;
  projectId?: number;
  project?: { name?: string };
  prefix?: string;
}

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
      const statusId = STATUS_MAP[status];

      const result = (await client.put(
        `/api/v1/project/${projectId}/task/${taskId}`,
        { id: taskId, performerId, statusId },
      )) as TaskResponse[];

      const task = Array.isArray(result) ? result[0] : result;

      const url = task.projectId
        ? `http://track.nordclan/projects/${task.projectId}/tasks/${task.id}`
        : "";

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                id: task.id,
                name: task.name,
                status,
                performer: task.performer?.fullNameRu ?? null,
                project: task.project?.name ?? "",
                url,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
