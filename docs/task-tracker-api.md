# Task Tracker API

Шаблон для документирования найденных эндпоинтов корпоративного трекера задач.

## Конфигурация

| Переменная | Описание | Пример |
|-----------|----------|--------|
| `TRACKER_BASE_URL` | Базовый URL трекера | `http://track.nordclan` |
| `TRACKER_LOGIN` | Логин | `andrew.yudin` |
| `TRACKER_PASSWORD` | Пароль | `***` |

## Как находить эндпоинты

1. Откройте трекер в браузере
2. DevTools → Network
3. Выполните действие (создать задачу, сменить статус и т.д.)
4. Найдите запрос → Copy as cURL
5. Скиньте cURL агенту — он создаст tool на основе запроса

## Зарегистрированные эндпоинты

<!-- Заполняйте по мере добавления tools -->

| Tool | Метод | Путь | Описание |
|------|-------|------|----------|
| `refresh_session` | POST | `/api/v1/auth/login` | Авторизация по login/password, получение JWT-cookie |

## Эндпоинт авторизации

**POST** `/api/v1/auth/login`

Request body:
```json
{ "login": "your_login", "password": "your_password" }
```

Response headers contain `Set-Cookie: authorization=Basic%20{JWT}`.

JWT используется для авторизации последующих запросов. Срок жизни — 7 дней.

## Шаблон: новый tool

```typescript
// src/tools/my-tool.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient } from "../client/api-client.js";

export function registerMyTool(server: McpServer, client: ApiClient): void {
  server.tool(
    "my-tool",
    {
      param: z.string().describe("Описание параметра"),
    },
    async ({ param }) => {
      const result = await client.get(`/api/path/${param}`);
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

Не забудьте зарегистрировать tool в `src/tools/index.ts`:

```typescript
import { registerMyTool } from "./my-tool.js";

export function registerAllTools(server: McpServer, client: ApiClient): void {
  registerHelloTool(server);
  registerMyTool(server, client);
}
```
