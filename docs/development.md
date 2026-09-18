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
| `npm run start:http` | Запуск HTTP-сервера (порт 3000) |
| `npm run inspector` | Запуск MCP Inspector (веб-UI) |

## Переменные окружения

### Общие

| Переменная | Описание | По умолчанию |
|-----------|----------|--------------|
| `TRACKER_BASE_URL` | Базовый URL трекера | — |
| `TRACKER_LOGIN` | Логин трекера | — |
| `TRACKER_PASSWORD` | Пароль трекера | — |
| `TRACKER_USER_ID` | ID пользователя в трекере (число) | — |

### HTTP-режим

| Переменная | Описание | По умолчанию |
|-----------|----------|--------------|
| `MCP_API_KEY` | API-ключ для авторизации | — (dev-режим) |
| `MCP_PORT` | Порт HTTP-сервера | `3000` |
| `MCP_HOST` | Хост для привязки | `0.0.0.0` |

## Процесс разработки

1. Внесите изменения в `src/`
2. **Обновите документацию** (см. раздел ниже)
3. Запустите `npm run build`
4. Запустите `npm run inspector` для проверки в веб-интерфейсе
5. Или `npm start` для запуска в консоли

## Как добавить новый Resource + Tool

Используйте фабрику `registerResourceWithTool()` — она регистрирует и MCP resource, и tool из одного fetcher'а. Это необходимо, т.к. некоторые клиенты (LibreChat и др.) не поддерживают ресурсы.

1. Создайте файл `src/resources/tracker/my-data.ts`:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../../client/api-client.js";
import { registerResourceWithTool } from "../resource-tool-factory.js";

interface MyDataItem {
  id: number;
  name: string;
}

export async function fetchMyData(
  client: ApiClient,
): Promise<MyDataItem[]> {
  const response = (await client.get("/api/v1/my-data")) as
    | MyDataItem[]
    | { data?: MyDataItem[] };

  const items: MyDataItem[] = Array.isArray(response)
    ? response
    : response?.data ?? [];

  return items.map((item) => ({ id: item.id, name: item.name }));
}

export function registerMyDataResource(
  server: McpServer,
  client: ApiClient,
): void {
  registerResourceWithTool(server, client, {
    name: "my-data",            // имя ресурса
    uri: "tracker://my/data",   // URI ресурса
    fetcher: fetchMyData,       // функция получения данных
  });
}
```

2. Зарегистрируйте в `src/resources/tracker/index.ts`:

```typescript
import { registerMyDataResource } from "./my-data.js";

export function registerTrackerResources(server: McpServer, client: ApiClient): void {
  registerMyDataResource(server, client);
}
```

3. `npm run build` — перекомпилируйте
4. `npm run inspector` — убедитесь, что resource и tool появились в UI

Имя tool выводится автоматически из URI: `tracker://my/data` → `tracker_get_my_data`. Чтобы переопределить, передайте `toolName` и/или `toolDescription` в opts.

## Как добавить новый Tool (без ресурса)

1. Создайте файл `src/tools/tracker/my-tool.ts`:

```typescript
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

2. Зарегистрируйте в `src/tools/tracker/index.ts`:

```typescript
import { registerMyTool } from "./my-tool.js";

export function registerTrackerTools(server: McpServer, client: ApiClient): void {
  registerMyTool(server, client);
}
```

3. `npm run build` — перекомпилируйте
4. `npm run inspector` — убедитесь, что tool появился в UI

Подробнее: [docs/task-tracker-api.md](./task-tracker-api.md)

## Обновление документации

**При добавлении или изменении логики (tools, resources, API-эндпоинтов, архитектуры) необходимо обновлять документацию:**

| Что изменилось | Какие файлы обновлять |
|----------------|----------------------|
| Новый tool / resource | `docs/architecture.md` (структура файлов, таблица tools/resources), `docs/task-tracker-api.md` (таблица эндпоинтов), `AGENTS.md` (структура файлов) |
| Новый API-эндпоинт трекера | `docs/task-tracker-api.md` (описание эндпоинта) |
| Изменение архитектуры | `docs/architecture.md` |
| Новая команда / env-переменная | `docs/development.md`, `AGENTS.md` |
| Фабрика / паттерн регистрации | `docs/development.md` (раздел "Как добавить") |

Не обновлённая документация ведёт к ошибкам агентов и разработчиков, работающих с проектом.

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
