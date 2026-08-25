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

┌─────────────────┐    HTTP (port 3000)    ┌──────────────────┐
│  MCP-клиенты    │◄──────────────────────►│  MCP-сервер      │
│  (агенты,       │  POST /mcp             │  (build/http.js) │
│   сетевые)      │  Authorization: Bearer │                  │
└─────────────────┘  mcp-session-id: uuid  └────────┬─────────┘
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
