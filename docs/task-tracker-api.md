# Task Tracker API

Шаблон для документирования найденных эндпоинтов корпоративного трекера задач.

## Конфигурация

| Переменная | Описание | Пример |
|-----------|----------|--------|
| `TRACKER_BASE_URL` | Базовый URL трекера | `http://track.nordclan` |
| `TRACKER_LOGIN` | Логин | `andrew.yudin` |
| `TRACKER_PASSWORD` | Пароль | `***` |
| `TRACKER_USER_ID` | ID пользователя для timesheets | `336` |

## Как находить эндпоинты

1. Откройте трекер в браузере
2. DevTools → Network
3. Выполните действие (создать задачу, сменить статус и т.д.)
4. Найдите запрос → Copy as cURL
5. Скиньте cURL агенту — он создаст tool на основе запроса

## Зарегистрированные tools

| Tool | Источник | Метод | Путь | Описание |
|------|----------|-------|------|----------|
| `tracker_get_tasks_my` | resource factory | GET | `/api/v1/task?isOnlyMine=true` | Мои задачи по колонкам доски |
| `tracker_get_projects` | resource factory | GET | `/api/v1/project-all` | Список всех проектов |
| `tracker_get_team_members` | resource factory | GET | `/api/v1/user/roles?status=true&departments=36` | Участники команды (активные) |
| `tracker_create_task` | standalone tool | POST | `/api/v1/project/{projectId}/task` | Создание задачи |
| `tracker_get_current_user` | standalone tool | GET | `/api/v1/user/me` | Информация о текущем залогиненном пользователе |
| `tracker_get_task` | standalone tool | GET | `/api/v1/project/{projectId}/task/{taskId}` | Детальная информация о задаче |
| `tracker_get_timesheets_my` | standalone tool | GET | `/api/v1/timesheet` | Отчёты по времени за период |
| `tracker_transfer_task` | standalone tool | PUT | `/api/v1/project/{projectId}/task/{taskId}` | Перевод задачи в новый статус / смена исполнителя |
| `tracker_log_time` | standalone tool | POST | `/api/v1/timesheet` | Списание времени на задачу |
| `get_current_time` | standalone tool | — | — | Текущая дата и время сервера |

Все tools из resource factory используют один fetcher с ресурсом. Имя tool выводится автоматически из URI (`tracker://tasks/my` → `tracker_get_tasks_my`).

## Эндпоинт: мои задачи

**GET** `/api/v1/task`

Параметры (query string):

| Параметр | Тип | Описание |
|----------|-----|----------|
| `isOnlyMine` | boolean | Только мои задачи |
| `fields` | string | Поля через запятую |

Возвращает задачи, сгруппированные по колонкам доски: New, Develop, Code Review, QA, Done. Статусы 9 (Canceled) и 10 (Closed) исключены.

## Эндпоинт: все проекты

**GET** `/api/v1/project-all`

Без параметров. Возвращает массив `{ id, name }`.

## Эндпоинт: участники команды

**GET** `/api/v1/user/roles`

| Параметр | Тип | Описание |
|----------|-----|----------|
| `status` | boolean | Статус участника |
| `departments` | number | ID департамента (36 — наш) |

Фильтрация по `active === 1` на клиенте. Возвращает массив `{ id, fullNameRu }`.

## Эндпоинт: создание задачи

**POST** `/api/v1/project/{projectId}/task`

| Параметр | Тип | Описание |
|----------|-----|----------|
| `projectId` | number | ID проекта (path parameter) |

Request body:

| Поле | Тип | Описание |
|------|-----|----------|
| `name` | string | Название задачи |
| `description` | string | HTML-описание |
| `performerId` | number | ID исполнителя |
| `statusId` | number | Статус (1 = New) |
| `typeId` | number | Тип (1 = task, 2 = bug) |
| `prioritiesId` | number | Приоритет (1-5, по умолчанию 3) |
| `sprintId` | null | Спринт |
| `plannedExecutionTime` | number | Планируемое время |
| `isTaskByClient` | boolean | Задача от клиента |
| `isDevOps` | boolean | DevOps-задача |
| `deadline` | null | Дедлайн |
| `parentId` | number | ID родительской задачи (необязательно) |

Возвращает DTO задачи ( taskId, name, type, status, priority, performer, author, project, parentId, url, createdAt).

## Эндпоинт: текущий пользователь

**GET** `/api/v1/user/me`

Без параметров. Идентификация по cookie-авторизации.

Возвращает информацию о текущем залогиненном пользователе. Tool возвращает подмножество полей:

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | number | ID пользователя |
| `fullNameRu` | string | ФИО (рус.) |
| `fullNameEn` | string | ФИО (англ.) |
| `emailPrimary` | string | Рабочий email |
| `telegram` | string | Telegram |
| `phone` | string | Рабочий телефон |
| `mobile` | string | Мобильный телефон |
| `company` | string | Компания |
| `department` | string | Отдел |
| `city` | string | Город |
| `globalRole` | string | Глобальная роль (например, "VISOR") |
| `isActive` | boolean | Активен ли пользователь |
| `employmentDate` | string | Дата трудоустройства (ISO) |

## Эндпоинт: детали задачи

**GET** `/api/v1/project/{projectId}/task/{taskId}`

| Параметр | Тип | Описание |
|----------|-----|----------|
| `projectId` | number | ID проекта (path parameter) |
| `taskId` | number | ID задачи (path parameter) |

Возвращает полный DTO задачи с полями: id, name, type, status, description, priority, performer, author, project, parentId, url, createdAt.

## Эндпоинт: timesheets

**GET** `/api/v1/timesheet`

| Параметр | Тип | Описание |
|----------|-----|----------|
| `userId` | number | ID пользователя (из env `TRACKER_USER_ID`) |
| `dateBegin` | string | Дата начала (YYYY-MM-DD) |
| `dateEnd` | string | Дата окончания (YYYY-MM-DD) |

Возвращает массив записей timesheet. Tool возвращает упрощённый массив: `{ date, spentTime, taskId }`.

## Эндпоинт: перевод задачи

**PUT** `/api/v1/project/{projectId}/task/{taskId}`

| Параметр | Тип | Описание |
|----------|-----|----------|
| `projectId` | number | ID проекта (path parameter) |
| `taskId` | number | ID задачи (path parameter) |

Request body:

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | number | ID задачи |
| `performerId` | number | ID исполнителя (0 = без исполнителя) |
| `statusId` | number | Статус (1=New, 2=Develop, 4=Code Review, 6=QA, 8=Done) |

Возвращает массив с одним обновлённым DTO задачи.

## Эндпоинт: списание времени

**POST** `/api/v1/timesheet`

Request body:

| Поле | Тип | Описание |
|------|-----|----------|
| `isDraft` | boolean | Черновик (всегда `false`) |
| `taskId` | number | ID задачи |
| `typeId` | string | Тип записи (всегда `"1"`) |
| `spentTime` | number | Затраченное время в часах |
| `onDate` | string | Дата в формате YYYY-MM-DD |
| `projectId` | number | ID проекта |
| `sprintId` | null | Спринт (всегда `null`) |

Создаёт запись в журнале работ по задаче.

## Шаблон: новый tool (standalone)

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

Не забудьте зарегистрировать tool в `src/tools/tracker/index.ts`.

## Шаблон: новый resource + tool (через фабрику)

```typescript
// src/resources/tracker/my-data.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../../client/api-client.js";
import { registerResourceWithTool } from "../resource-tool-factory.js";

export async function fetchMyData(client: ApiClient): Promise<MyDataItem[]> {
  const response = (await client.get("/api/v1/my-data")) as
    | MyDataItem[]
    | { data?: MyDataItem[] };

  const items: MyDataItem[] = Array.isArray(response)
    ? response
    : response?.data ?? [];

  return items.map((item) => ({ id: item.id, name: item.name }));
}

export function registerMyDataResource(server: McpServer, client: ApiClient): void {
  registerResourceWithTool(server, client, {
    name: "my-data",
    uri: "tracker://my/data",
    fetcher: fetchMyData,
  });
}
```

Не забудьте зарегистрировать в `src/resources/tracker/index.ts` и обновить документацию.
