import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient } from "../../client/api-client.js";

export function registerLogTimeTool(
  server: McpServer,
  client: ApiClient,
): void {
  server.tool(
    "tracker_log_time",
    "Списать время на задачу в трекере. Добавляет запись о затраченном времени в журнал работ по задаче.",
    {
      taskId: z.number().describe("ID задачи"),
      projectId: z.number().describe("ID проекта"),
      onDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe("Дата в формате YYYY-MM-DD"),
      spentTime: z.number().describe("Затраченное время в часах"),
    },
    async ({ taskId, projectId, onDate, spentTime }) => {
      const body = {
        isDraft: false,
        taskId,
        typeId: "1",
        spentTime,
        onDate,
        projectId,
        sprintId: null,
      };

      const result = await client.post("/api/v1/timesheet", body);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                taskId,
                projectId,
                onDate,
                spentTime,
                result,
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
