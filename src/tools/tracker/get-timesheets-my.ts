import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient } from "../../client/api-client.js";
import { TRACKER_USER_ID } from "../../config.js";

interface TimesheetEntry {
  id: number;
  onDate: string;
  spentTime: string;
  task?: { id: number; name: string };
  project?: { id: number };
}

export function registerGetTimesheetsMyTool(
  server: McpServer,
  client: ApiClient,
): void {
  server.tool(
    "tracker_get_timesheets_my",
    "Получить мои отчёты по времени (timesheets) за период. Даты в формате YYYY-MM-DD. Норма рабочей недели — 40 часов (8 часов в день, пн-пт).",
    {
      dateFrom: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe("Дата начала периода (YYYY-MM-DD)"),
      dateTo: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe("Дата окончания периода (YYYY-MM-DD)"),
    },
    async ({ dateFrom, dateTo }) => {
      if (!TRACKER_USER_ID) {
        return {
          content: [
            {
              type: "text" as const,
              text: "TRACKER_USER_ID is not set. Configure the environment variable.",
            },
          ],
          isError: true,
        };
      }

      const data = (await client.get(
        `/api/v1/timesheet?userId=${TRACKER_USER_ID}&dateBegin=${dateFrom}&dateEnd=${dateTo}`,
      )) as TimesheetEntry[];

      const entries = Array.isArray(data) ? data : [];
      const output = entries.map((e) => ({
        date: e.onDate,
        taskName: e.task?.name ?? "",
        taskId: e.task?.id ?? null,
        projectId: e.project?.id ?? null,
        spentTime: e.spentTime,
      }));

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
