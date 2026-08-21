# Plan: MCP Tool — Create Task

## Context

Проект перешёл на resources-only архитектуру (tools были удалены). Пользователь просит вернуть tools и добавить инструмент создания задачи через `POST /api/v1/project/{projectId}/task`.

## API

**POST** `/api/v1/project/{projectId}/task`

Request body:
```json
{
  "name": "Front. Тестовая задача.",
  "projectId": 563,
  "description": "<p>Описание</p>",
  "performerId": 336,
  "statusId": 1,
  "typeId": 1,
  "sprintId": null,
  "prioritiesId": 3,
  "plannedExecutionTime": 0,
  "isTaskByClient": false,
  "isDevOps": false,
  "deadline": null
}
```

## Параметры tool (с описаниями)

| Параметр | Тип | Описание |
|----------|-----|----------|
| `name` | string | Название задачи. Для фронта: "Front. {...}", для бека: "Back. {...}" |
| `description` | string | HTML-описание (базовые теги: `<p>`, `<strong>`, `<br>`, `<ul>`, `<li>`) |
| `projectId` | number | ID проекта (из ресурса `tracker://projects`) |
| `performerId` | number | ID исполнителя (из ресурса `tracker://team/members`) |
| `isBug` | boolean | Является ли задача багом (typeId: 2=баг, 1=фича) |
| `prioritiesId` | number | Приоритет 1-5 (1=высший, 5=низший) |

## Шаги

### 1. Восстановить структуру tools

Создать:
- `src/tools/index.ts` — `registerAllTools(server, client)`
- `src/tools/tracker/index.ts` — `registerTrackerTools(server, client)`
- `src/tools/tracker/create-task.ts` — новый tool

### 2. `src/tools/tracker/create-task.ts`

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient } from "../../client/api-client.js";

export function registerCreateTaskTool(server: McpServer, client: ApiClient): void {
  server.tool(
    "tracker_create_task",
    "Создать задачу в трекере",
    {
      name: z.string().describe('Название задачи. Для фронта: "Front. {...}", для бека: "Back. {...}"'),
      description: z.string().describe("HTML-описание задачи (базовые теги: <p>, <strong>, <br>, <ul>, <li>)"),
      projectId: z.number().describe("ID проекта (из ресурса tracker://projects)"),
      performerId: z.number().describe("ID исполнителя (из ресурса tracker://team/members)"),
      isBug: z.boolean().describe("Является ли задача багом (true → typeId=2, false → typeId=1)"),
      prioritiesId: z.number().min(1).max(5).describe("Приоритет: 1=высший, 5=низший"),
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
```

### 3. Регистрация

`src/tools/tracker/index.ts`:
```typescript
import { registerCreateTaskTool } from "./create-task.js";

export function registerTrackerTools(server: McpServer, client: ApiClient): void {
  registerCreateTaskTool(server, client);
}
```

`src/tools/index.ts`:
```typescript
import { registerTrackerTools } from "./tracker/index.js";

export function registerAllTools(server: McpServer, client: ApiClient): void {
  registerTrackerTools(server, client);
}
```

### 4. Подключение в `server.ts`

Добавить `import { registerAllTools } from "./tools/index.js";` и вызов `registerAllTools(server, client);` после `registerAllResources`.

### 5. Валидация

- `npm run build` — компиляция без ошибок
- `npm run inspector` — проверить что tool `tracker_create_task` отображается и работает

## Файлы

| Действие | Файл |
|----------|------|
| Создать | `src/tools/index.ts` |
| Создать | `src/tools/tracker/index.ts` |
| Создать | `src/tools/tracker/create-task.ts` |
| Изменить | `src/server.ts` (добавить registerAllTools) |
