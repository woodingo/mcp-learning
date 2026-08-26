# Архитектура проекта

## Стек технологий

| Компонент | Технология |
|-----------|-----------|
| Runtime | Node.js v22 |
| Язык | TypeScript 7.x (ES2022 target) |
| MCP SDK | `@modelcontextprotocol/sdk` ^1.30.0 |
| Модули | ES Modules (NodeNext resolution) |
| Транспорт | stdio / HTTP (StreamableHTTPServerTransport) |
| HTTP фреймворк | Express 5 (транзитивная зависимость SDK) |

## Структура файлов

```
mcp-learning/
├── src/
│   ├── index.ts                # Точка входа: main() — stdio режим
│   ├── http.ts                 # Точка входа: HTTP режим с API-ключом
│   ├── server.ts               # Создание McpServer, подключение транспорта
│   ├── config.ts               # Переменные окружения
│   ├── client/
│   │   └── api-client.ts       # HTTP-клиент с cookie-авторизацией
│   ├── tools/
│   │   ├── index.ts            # registerAllTools(server, client)
│   │   └── tracker/
│   │       ├── index.ts        # registerTrackerTools(server, client)
│   │       └── create-task.ts  # Tool: tracker_create_task
│   └── resources/
│       ├── index.ts            # registerAllResources(server, client)
│       ├── resource-tool-factory.ts  # Фабрика: ресурс + tool из одного fetcher'а
│       └── tracker/
│           ├── index.ts        # registerTrackerResources(server, client)
│           ├── my-tasks.ts     # Resource: tracker://tasks/my, Tool: tracker_get_tasks_my
│           ├── projects.ts     # Resource: tracker://projects, Tool: tracker_get_projects
│           └── team-members.ts # Resource: tracker://team/members, Tool: tracker_get_team_members
├── build/                      # Скомпилированный JS (сгенерирован tsc)
├── docs/                       # Документация
├── package.json
├── tsconfig.json
└── mcp-server.service          # Systemd unit для автозапуска
```

## Как работает MCP-сервер

Сервер построен на высококлассном API (`McpServer`) из официального MCP SDK.

### Режимы запуска

Сервер поддерживает два режима запуска:

| Режим | Команда | Транспорт | Использование |
|-------|---------|-----------|---------------|
| stdio | `npm start` | stdin/stdout | Локальная разработка, Claude Desktop |
| HTTP | `npm run start:http` | Streamable HTTP | Сетевой доступ, несколько клиентов |

### Транспорт

**stdio** — стандартный ввод/вывод для обмена JSON-RPC сообщениями. Клиент запускает сервер как дочерний процесс и общается с ним через stdin/stdout.

**HTTP** — Express-сервер на порту 3000 (настраивается через `MCP_PORT`). Поддерживает:
- `GET /health` — healthcheck (без auth)
- `ALL /mcp` — MCP-эндпоинт с роутингом по сессиям
- Авторизацию через `Authorization: Bearer <key>` (API-ключ)
- Мультиклиентность через `Map<sessionId, transport>`

### API-ключ (HTTP-режим)

При запуске в HTTP-режиме можно задать `MCP_API_KEY` для защиты сервера:
- Если `MCP_API_KEY` задан — все запросы к `/mcp` требуют заголовок `Authorization: Bearer <key>`
- Если `MCP_API_KEY` не задан — auth пропускается (dev-режим)
- `GET /health` всегда доступен без auth

### Ресурсы и инструменты

Для каждого ресурса автоматически создаётся дублирующий tool (\LibreChat и др. клиенты не поддерживают ресурсы). Оба используют один и тот же fetcher-обработчик через фабрику `registerResourceWithTool()`.

| Ресурс | Tool | Описание |
|--------|------|----------|
| `tracker://tasks/my` | `tracker_get_tasks_my` | Мои задачи по колонкам доски |
| `tracker://projects` | `tracker_get_projects` | Список всех проектов |
| `tracker://team/members` | `tracker_get_team_members` | Участники команды |
| — | `tracker_create_task` | Создание задачи (standalone tool) |

### Фабрика ресурсов и инструментов

`src/resources/resource-tool-factory.ts` — функция `registerResourceWithTool()` принимает:
- `name` — имя ресурса
- `uri` — URI ресурса
- `fetcher` — async-функция `(client) => Promise<unknown>`
- Необязательные: `toolName` (override имени tool), `toolDescription`

Имя tool выводится автоматически из URI: `tracker://tasks/my` → `tracker_get_tasks_my`.

## Схема взаимодействия

```
┌─────────────────┐         stdio          ┌──────────────────┐
│  MCP-клиент     │◄──────────────────────►│  MCP-сервер      │
│  (Claude,       │    JSON-RPC messages   │  (build/index.js)│
│   Inspector)    │                        │                  │
└─────────────────┘                        └────────┬─────────┘
                                                    │
                                      ┌─────────────┴──────────────┐
                                      │                            │
                                ┌─────▼─────┐              ┌──────▼──────┐
                                │ Resources │              │    Tools    │
                                │ + Tools   │              │(create_task)│
                                │ (factory) │              └─────────────┘
                                └───────────┘

┌─────────────────┐    HTTP (port 3000)    ┌──────────────────┐
│  MCP-клиенты    │◄──────────────────────►│  MCP-сервер      │
│  (агенты,       │  POST /mcp             │  (build/http.js) │
│   сетевые)      │  Authorization: Bearer │                  │
└─────────────────┘  mcp-session-id: uuid  └────────┬─────────┘
                                                     │
                                       ┌─────────────┴──────────────┐
                                       │                            │
                                 ┌─────▼─────┐              ┌──────▼──────┐
                                 │ Resources │              │    Tools    │
                                 │ + Tools   │              │(create_task)│
                                 │ (factory) │              └─────────────┘
                                 └───────────┘
```

## Добавление нового компонента

### Новый Resource + Tool (рекомендуется)

Используйте фабрику — она регистрирует и resource, и tool из одного fetcher'а:

```typescript
// src/resources/tracker/my-data.ts
import { registerResourceWithTool } from "../resource-tool-factory.js";

export async function fetchMyData(client: ApiClient): Promise<MyData[]> {
  // логика получения данных
}

export function registerMyDataResource(server: McpServer, client: ApiClient): void {
  registerResourceWithTool(server, client, {
    name: "my-data",
    uri: "tracker://my/data",
    fetcher: fetchMyData,
  });
}
```

Зарегистрируйте в `src/resources/tracker/index.ts`. Подробности: [docs/development.md](./development.md).

### Новый Tool (без ресурса)

Создайте `src/tools/tracker/my-tool.ts` и зарегистрируйте в `src/tools/tracker/index.ts`.
