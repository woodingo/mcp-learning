import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGetCurrentTimeTool(server: McpServer): void {
  server.tool(
    "get_current_time",
    "Получить текущую дату и время сервера. Возвращает ISO 8601 и читаемый формат.",
    {},
    async () => {
      const now = new Date();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                iso: now.toISOString(),
                local: now.toLocaleString("ru-RU", {
                  timeZone: "Europe/Moscow",
                }),
                timezone: "Europe/Moscow",
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
