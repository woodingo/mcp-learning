# Разработка

## Установка зависимостей

```bash
npm install
```

## Команды

| Команда | Описание |
|---------|----------|
| `npm run build` | Компиляция TypeScript в `build/` |
| `npm start` | Запуск сервера через stdio |
| `npm run inspector` | Запуск MCP Inspector (веб-UI) |

## Процесс разработки

1. Внесите изменения в `src/`
2. Запустите `npm run build`
3. Запустите `npm run inspector` для проверки в веб-интерфейсе
4. Или `npm start` для запуска в консоли

## Как добавить новый Tool

1. Создайте файл `src/tools/my-tool.ts`:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient } from "../client/api-client.js";

export function registerMyTool(server: McpServer, client: ApiClient): void {
  server.tool(
    "my-tool",                          // уникальное имя
    {                                    // параметры (Zod-схемы)
      input: z.string().describe("Входные данные"),
    },
    async ({ input }) => {             // обработчик
      const result = await client.get(`/api/endpoint/${input}`);
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
```

2. Зарегистрируйте в `src/tools/index.ts`:

```typescript
import { registerMyTool } from "./my-tool.js";

export function registerAllTools(server: McpServer, client: ApiClient): void {
  registerHelloTool(server);
  registerMyTool(server, client);
}
```

3. `npm run build` — перекомпилируйте
4. `npm run inspector` — убедитесь, что tool появился в UI

Подробнее: [docs/task-tracker-api.md](./task-tracker-api.md)

## Как добавить новый Resource

```typescript
server.resource(
  "my-resource",            // имя ресурса
  "my-scheme://path",       // URI
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify({ key: "value" }),
      },
    ],
  })
);
```

## Как запустить Inspector для отладки

```bash
npm run inspector
```

Откроется http://localhost:6274 с веб-интерфейсом для просмотра и вызова tools/resources. Подробнее в [docs/mcp-inspector.md](./mcp-inspector.md).

## Добавление зависимостей

```bash
npm install <package>
```

Для dev-зависимостей:

```bash
npm install -D <package>
```
