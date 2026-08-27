import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient } from "../../client/api-client.js";
import { toTaskOutput, type RawTask } from "../../resources/tracker/task-dto.js";

export function registerGetTaskTool(
  server: McpServer,
  client: ApiClient,
): void {
  server.tool(
    "tracker_get_task",
    "Получить детальную информацию о задаче. В списке моих задач возвращаются не все задачи, над которыми я работаю — некоторые могут быть назначены на других исполнителей. Также этот инструмент полезен для получения информации о родительской задаче.",
    {
      taskId: z.number().describe("ID задачи"),
      projectId: z.number().describe("ID проекта (из URL задачи или из ресурса tracker://projects)"),
    },
    async ({ taskId, projectId }) => {
      const result = (await client.get(
        `/api/v1/project/${projectId}/task/${taskId}`,
      )) as RawTask;

      const task = Array.isArray(result) ? result[0] : result;
      const output = toTaskOutput(task);

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
