import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient } from "../../client/api-client.js";

export function registerCreateTaskTool(
  server: McpServer,
  client: ApiClient,
): void {
  server.tool(
    "tracker_create_task",
    "Создать задачу в трекере",
    {
      name: z
        .string()
        .describe(
          'Название задачи. Для фронта: "Front. {...}", для бека: "Back. {...}"',
        ),
      description: z
        .string()
        .describe(
          "HTML-описание задачи (базовые теги: <p>, <strong>, <br>, <ul>, <li>)",
        ),
      projectId: z.number().describe("ID проекта (из ресурса tracker://projects)"),
      performerId: z
        .number()
        .describe("ID исполнителя (из ресурса tracker://team/members)"),
      isBug: z
        .boolean()
        .describe("Является ли задача багом (true → typeId=2, false → typeId=1)"),
      prioritiesId: z
        .number()
        .min(1)
        .max(5)
        .default(3)
        .describe("Приоритет: 1=высший, 5=низший (по умолчанию 3)"),
    },
    async ({ name, description, projectId, performerId, isBug, prioritiesId }) => {
      const body = {
        name,
        projectId,
        description,
        performerId,
        statusId: 1,
        typeId: isBug ? 2 : 1,
        sprintId: null,
        prioritiesId,
        plannedExecutionTime: 0,
        isTaskByClient: false,
        isDevOps: false,
        deadline: null,
      };

      const result = await client.post(`/api/v1/project/${projectId}/task`, body);
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
