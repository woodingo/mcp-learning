# Plan: tracker_get_timesheets_my

## Context

Добавить standalone tool `tracker_get_timesheets_my` для получения отчётов по времени из трекера.  
API: `GET /api/v1/timesheet?userId={userId}&dateBegin={dateFrom}&dateEnd={dateTo}`  
`userId` берётся из env `TRACKER_USER_ID`. Даты в формате `YYYY-MM-DD`.  
Агенту возвращается упрощённый массив: `{ date, spentTime, taskId }`.

## Decisions

- **Standalone tool** (не resource factory), т.к. требует обязательные параметры `dateFrom` и `dateTo`.
- **`TRACKER_USER_ID`** добавляется в `config.ts` как `number` (с fallback на `0`).
- **Валидация дат** через zod `.regex(/^\d{4}-\d{2}-\d{2}$/)`.
- **Вывод**: массив `{ date: string, spentTime: string, taskId: number }` — минимальный набор для агента.

## Steps

### 1. Добавить `TRACKER_USER_ID` в config

**Файл:** `src/config.ts`

Добавить строку:
```ts
export const TRACKER_USER_ID = Number(process.env.TRACKER_USER_ID ?? 0);
```

### 2. Добавить `TRACKER_USER_ID` в `.env.example`

**Файл:** `.env.example`

Добавить строку:
```
TRACKER_USER_ID=336
```

### 3. Создать tool

**Файл:** `src/tools/tracker/get-timesheets-my.ts`

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient } from "../../client/api-client.js";
import { TRACKER_USER_ID } from "../../config.js";

interface TimesheetEntry {
  id: number;
  onDate: string;
  spentTime: string;
  task?: { id: number };
}

export function registerGetTimesheetsMyTool(
  server: McpServer,
  client: ApiClient,
): void {
  server.tool(
    "tracker_get_timesheets_my",
    "Получить мои отчёты по времени (timesheets) за период. Даты в формате YYYY-MM-DD.",
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
        spentTime: e.spentTime,
        taskId: e.task?.id ?? null,
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
```

### 4. Зарегистрировать tool

**Файл:** `src/tools/tracker/index.ts`

- Импортировать `registerGetTimesheetsMyTool` из `./get-timesheets-my.js`
- Вызвать `registerGetTimesheetsMyTool(server, client)` в `registerTrackerTools`

### 5. Обновить документацию

**`docs/task-tracker-api.md`** — добавить строку в таблицу tools:
```
| `tracker_get_timesheets_my` | standalone tool | GET | `/api/v1/timesheet` | Отчёты по времени за период |
```

И добавить секцию эндпоинта:
```md
## Эндпоинт: timesheets

**GET** `/api/v1/timesheet`

| Параметр | Тип | Описание |
|----------|-----|----------|
| `userId` | number | ID пользователя (из env TRACKER_USER_ID) |
| `dateBegin` | string | Дата начала (YYYY-MM-DD) |
| `dateEnd` | string | Дата окончания (YYYY-MM-DD) |

Возвращает массив записей timesheet. Tool возвращает упрощённый массив: `{ date, spentTime, taskId }`.
```

**`docs/architecture.md`** — добавить строку в таблицу tools:
```
| — | `tracker_get_timesheets_my` | Отчёты по времени за период (standalone tool) |
```

И добавить `get-timesheets-my.ts` в дерево файлов.

**`AGENTS.md`** — добавить строку в таблицу tools:
```
| `tracker_get_timesheets_my` | standalone tool | Отчёты по времени за период |
```

И добавить `TRACKER_USER_ID` в таблицу env-переменных.

### 6. Собрать и проверить

```bash
npm run build
```

## Validation

1. `npm run build` — без ошибок
2. `npm run inspector` → вызвать `tracker_get_timesheets_my` с `dateFrom=2026-08-24`, `dateTo=2026-08-27` → получить массив `{ date, spentTime, taskId }`
