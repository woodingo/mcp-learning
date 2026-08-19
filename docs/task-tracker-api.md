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

| Tool | Метод | Путь | Описание |
|------|-------|------|----------|
| `tracker_refresh_session` | POST | `/api/v1/auth/login` | Авторизация по login/password, получение JWT-cookie |
| `tracker_list_projects` | GET | `/api/v1/project` | Список проектов с фильтрацией |
| `tracker_get_project` | GET | `/api/v1/project/{projectId}` | Детали проекта по ID |

## Эндпоинт авторизации

**POST** `/api/v1/auth/login`

Request body:
```json
{ "login": "your_login", "password": "your_password" }
```

Response headers contain `Set-Cookie: authorization=Basic%20{JWT}`.

JWT используется для авторизации последующих запросов. Срок жизни — 7 дней.

## Эндпоинт: список проектов

**GET** `/api/v1/project`

Параметры (все optional, передаются как query string):

| Параметр | Тип | Описание |
|----------|-----|----------|
| `name` | string | Фильтр по имени проекта |
| `pageSize` | number | Размер страницы (по умолчанию 20) |
| `currentPage` | number | Номер страницы (по умолчанию 1) |
| `fields` | string | Поля через запятую (по умолчанию `name,statusId,createdAt`) |

## Эндпоинт: детали проекта

**GET** `/api/v1/project/{projectId}`

Параметры:

| Параметр | Тип | Описание |
|----------|-----|----------|
| `projectId` | number | ID проекта (path parameter) |

## Шаблон: новый tool

```typescript
// src/tools/tracker/my-tool.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient } from "../../client/api-client.js";

export function registerMyTool(server: McpServer, client: ApiClient): void {
  server.tool(
    "tracker_my_tool",
    "Описание tool",
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

Не забудьте зарегистрировать tool в `src/tools/tracker/index.ts`:

```typescript
import { registerMyTool } from "./my-tool.js";

export function registerTrackerTools(server: McpServer, client: ApiClient): void {
  registerTrackerListProjects(server, client);
  registerTrackerGetProject(server, client);
  registerMyTool(server, client);
}
```
