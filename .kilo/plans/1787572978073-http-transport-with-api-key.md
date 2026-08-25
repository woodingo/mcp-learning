# Plan: HTTP-транспорт с API-ключом

## Контекст

MCP-сервер работает только через stdio — один процесс на одного клиента, требуется доступ к файлам проекта. Нужно добавить HTTP-режим для доступа нескольких агентов по сети с защитой по API-ключу.

## Решения

| Вопрос | Решение |
|--------|---------|
| Заменить stdio? | Нет — оставить оба режима. stdio для локальной разработки, HTTP для продакшена |
| Транспорт | `StreamableHTTPServerTransport` (актуальный в SDK ^1.30.0, SSE deprecated) |
| Фреймворк | `express` — уже транзитивная зависимость SDK (`^5.2.1`), отдельно ставить не нужно |
| Типы | `@types/express` — добавить как devDependency |
| Сессии | Stateful — каждый клиент получает свою сессию (`sessionIdGenerator: () => randomUUID()`) |
| Мультиклиент | `Map<sessionId, { transport, server }>` — роутинг по заголовку `mcp-session-id` |
| Авторизация | Простой middleware: `Authorization: Bearer <key>` сверяется с `MCP_API_KEY` из env |
| Без ключа | Если `MCP_API_KEY` не задан — auth пропускается (dev-режим) |

## Архитектура

```
Клиент A                    Клиент B
  │                           │
  │ POST /mcp                 │ POST /mcp
  │ Authorization: Bearer xxx │ Authorization: Bearer xxx
  │ mcp-session-id: <uuid-a>  │ mcp-session-id: <uuid-b>
  ▼                           ▼
┌─────────────────────────────────────────┐
│  Express (0.0.0.0:3000)                │
│                                         │
│  1. API Key Middleware ──► 401/403      │
│  2. GET  /health ──────────► 200 OK     │
│  3. ALL  /mcp ──► session router        │
│       ├─ new init? ──► create session   │
│       ├─ has session? ──► route to it   │
│       └─ unknown? ──► 400               │
└─────────────────────────────────────────┘
```

## Файлы для изменения

### 1. `src/config.ts` — добавить переменные

```typescript
export const MCP_API_KEY = process.env.MCP_API_KEY ?? "";
export const MCP_PORT = Number(process.env.MCP_PORT ?? 3000);
export const MCP_HOST = process.env.MCP_HOST ?? "0.0.0.0";
```

### 2. `src/http.ts` — новый entry point (создать)

Основная логика:
- Express-приложение с JSON body parser
- API key middleware (проверка `Authorization: Bearer <key>`)
- `GET /health` — healthcheck без auth
- `ALL /mcp` — MCP endpoint с session routing:
  - Если `mcp-session-id` есть в Map → route to existing transport
  - Если POST с `initialize` method → create new session (new transport + new McpServer)
  - Иначе → 400
- Session lifecycle через `onsessioninitialized` / `onsessionclosed` callbacks
- Graceful shutdown (SIGTERM/SIGINT → close all sessions)

Ключевая логика роутинга:

```typescript
const sessions = new Map<string, StreamableHTTPServerTransport>();

app.all("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  // Существующая сессия
  if (sessionId && sessions.has(sessionId)) {
    const transport = sessions.get(sessionId)!;
    await transport.handleRequest(req, res, req.body);
    return;
  }

  // Новая сессия — только POST с initialize
  if (req.method === "POST" && req.body?.method === "initialize") {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => { sessions.set(id, transport); },
      onsessionclosed: (id) => { sessions.delete(id); },
    });
    const server = createServer(); // из server.ts
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    return;
  }

  res.status(400).json({ error: "Bad request: missing or invalid session" });
});
```

### 3. `package.json` — обновить

- Добавить `@types/express` в devDependencies
- Добавить скрипт `"start:http": "node -r dotenv/config build/http.js"`
- Скрипт `start` оставить как есть (stdio)

### 4. `.env.example` — добавить переменные

```
MCP_API_KEY=your-secret-key-here
MCP_PORT=3000
MCP_HOST=0.0.0.0
```

### 5. `mcp-server.service` — обновить ExecStart

```
ExecStart=/usr/bin/node /home/woody/Reps/temp/mcp-learning/build/http.js
```

Добавить `EnvironmentFile` для .env:
```
EnvironmentFile=/home/woody/Reps/temp/mcp-learning/.env
```

### 6. Документация — обновить

- `docs/architecture.md` — добавить HTTP-транспорт в схему и описание
- `docs/development.md` — добавить команды `start:http`, переменные окружения
- `AGENTS.md` — добавить `start:http` в таблицу команд

## Порядок реализации

1. `src/config.ts` — добавить `MCP_API_KEY`, `MCP_PORT`, `MCP_HOST`
2. `src/http.ts` — создать HTTP entry point
3. `package.json` — добавить `@types/express`, скрипт `start:http`
4. `npm install` — установить @types/express
5. `npm run build` — компиляция
6. Ручной тест: `MCP_API_KEY=test npm run start:http` → проверить `/health` и `/mcp` с curl
7. `.env.example` — обновить
8. `mcp-server.service` — обновить
9. Документация — обновить

## Валидация

1. `npm run build` — без ошибок TypeScript
2. `MCP_API_KEY=test npm run start:http` — сервер стартует на порту 3000
3. `curl http://localhost:3000/health` → 200 без auth
4. `curl -X POST http://localhost:3000/mcp` → 401 (нет ключа)
5. `curl -X POST -H "Authorization: Bearer wrong" http://localhost:3000/mcp` → 403
6. `curl -X POST -H "Authorization: Bearer test" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"initialize","id":1,"params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' http://localhost:3000/mcp` → 200 + `mcp-session-id` в заголовках
7. Повторный запрос с тем же `mcp-session-id` → роутинг к существующей сессии
8. Без `MCP_API_KEY` → все запросы проходят без auth (dev-режим)

## Риски

- **Express 5 + @types/express**: Express 5 может иметь несовместимости с типами из `@types/express` (написаны для v4). Если `tsc` выдаст ошибки — использовать `// @ts-express-ignore` или типизировать через `any` для middleware. SDK уже использует express 5 и компилируется, поэтому конфликт маловероятен.
- **Память**: Каждая сессия = отдельный McpServer + ApiClient. При большом количестве сессий нужно следить за утечками. `onsessionclosed` чистит Map, но нужно убедиться что transport/server корректно освобождают ресурсы.
