# Архитектура проекта

## Стек технологий

| Компонент | Технология |
|-----------|-----------|
| Runtime | Node.js v22 |
| Язык | TypeScript 7.x (ES2022 target) |
| MCP SDK | `@modelcontextprotocol/sdk` ^1.30.0 |
| Модули | ES Modules (NodeNext resolution) |
| Транспорт | stdio |

## Структура файлов

```
mcp-learning/
├── src/
│   ├── index.ts                # Точка входа: main()
│   ├── server.ts               # Создание McpServer, подключение транспорта
│   ├── config.ts               # TRACKER_BASE_URL, TRACKER_COOKIE из env
│   ├── client/
│   │   └── api-client.ts       # HTTP-клиент с cookie-авторизацией
│   ├── tools/
│   │   ├── index.ts            # registerAllTools(server, client)
│   │   └── hello.ts            # Tool: hello
│   └── resources/
│       ├── index.ts            # registerAllResources(server)
│       └── greeting.ts         # Resource: greeting://hello
├── build/                      # Скомпилированный JS (сгенерирован tsc)
├── docs/                       # Документация
├── package.json
├── tsconfig.json
└── mcp-server.service          # Systemd unit для автозапуска
```

## Как работает MCP-сервер

Сервер построен на высококлассном API (`McpServer`) из официального MCP SDK.

### Транспорт

Сервер использует **stdio** — стандартный ввод/вывод для обмена JSON-RPC сообщениями. Это базовый транспорт для MCP: клиент (Claude Desktop, Inspector) запускает сервер как дочерний процесс и общается с ним через stdin/stdout.

### Tool (инструмент)

Tool — это функция, которую клиент может вызвать. Сервер предоставляет tool `hello`:

- **Имя:** `hello`
- **Параметры:** `name` (string, необязательный) — имя для приветствия
- **Возвращает:** текстовое приветствие

### Resource (ресурс)

Resource — это данные, которые клиент может прочитать. Сервер предоставляет ресурс:

- **URI:** `greeting://hello`
- **Содержимое:** текст "Hello, World!"
- **MIME-тип:** text/plain

## Схема взаимодействия

```
┌─────────────────┐         stdio          ┌──────────────────┐
│  MCP-клиент     │◄──────────────────────►│  MCP-сервер      │
│  (Claude,       │    JSON-RPC messages   │  (build/index.js)│
│   Inspector)    │                        │                  │
└─────────────────┘                        └────────┬─────────┘
                                                    │
                                          ┌─────────┴─────────┐
                                          │                   │
                                    ┌─────▼─────┐     ┌──────▼──────┐
                                    │   Tool    │     │  Resource   │
                                    │  (hello)  │     │ (greeting)  │
                                    └───────────┘     └─────────────┘
```

## Добавление нового компонента

### Новый Tool

Создайте `src/tools/my-tool.ts` и зарегистрируйте в `src/tools/index.ts`. Подробности: [docs/task-tracker-api.md](./task-tracker-api.md), [docs/development.md](./development.md).

### Новый Resource

Создайте `src/resources/my-resource.ts` и зарегистрируйте в `src/resources/index.ts`.
