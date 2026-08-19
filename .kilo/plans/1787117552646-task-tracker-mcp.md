# Plan: MCP-сервер для корпоративного трекера задач

## Контекст

Есть корпоративный трекер задач с REST API без документации. Авторизация — cookie/сессия. Нужно обернуть API в MCP tools, чтобы локальные AI-агенты могли: смотреть задачи, создавать новые, логировать время, менять статус и исполнителя.

Текущий проект — рабочий MCP-сервер с одним tool (`hello`) и одним resource (`greeting://hello`). Весь код в `src/index.ts`.

## Решения

- **Модульная структура** — каждый tool/resource в отдельном файле
- **API-клиент** — класс с cookie-авторизацией, env-переменные для конфигурации
- **Инкрементальное добавление tools** — рефакторинг каркаса сейчас, tools по мере поступления endpoint'ов из DevTools

## Структура файлов после рефакторинга

```
src/
├── index.ts                # Точка входа: main()
├── server.ts               # Создание McpServer, подключение transport
├── config.ts               # BASE_URL, COOKIE из process.env
├── client/
│   └── api-client.ts       # HTTP-клиент: fetch + Cookie header
├── tools/
│   ├── index.ts            # registerAllTools(server, client)
│   ├── hello.ts            # Текущий hello tool
│   └── (будущие tools)     # list-tasks, create-task, log-time и т.д.
├── resources/
│   ├── index.ts            # registerAllResources(server)
│   └── greeting.ts         # Текущий greeting resource
```

## Шаги реализации

### 1. Создать `src/config.ts`
```typescript
export const TRACKER_BASE_URL = process.env.TRACKER_BASE_URL ?? "";
export const TRACKER_COOKIE = process.env.TRACKER_COOKIE ?? "";
```

### 2. Создать `src/client/api-client.ts`
Класс `ApiClient`:
- `constructor(baseUrl: string, cookie: string)`
- `get(path: string): Promise<unknown>`
- `post(path: string, body?: unknown): Promise<unknown>`
- `patch(path: string, body?: unknown): Promise<unknown>`
- Общий `fetch` с заголовком `Cookie`
- Бросает ошибку с HTTP-статусом при не-2xx ответах

### 3. Создать `src/tools/hello.ts`
Вынести текущий hello tool из `src/index.ts` в отдельный файл. Экспортировать функцию `registerHelloTool(server: McpServer)`.

### 4. Создать `src/tools/index.ts`
Экспортировать `registerAllTools(server: McpServer, client: ApiClient)`. Вызывает `registerHelloTool(server)` и (в будущем) другие регистрации.

### 5. Создать `src/resources/greeting.ts`
Вынести текущий greeting resource. Экспортировать `registerGreetingResource(server: McpServer)`.

### 6. Создать `src/resources/index.ts`
Экспортировать `registerAllResources(server: McpServer)`. Вызывает `registerGreetingResource(server)`.

### 7. Создать `src/server.ts`
Экспортировать `createServer(): McpServer` — создаёт инстанс сервера, регистрирует tools и resources.

### 8. Переписать `src/index.ts`
Только точка входа: импортирует `createServer`, создаёт `StdioServerTransport`, вызывает `server.connect(transport)`.

### 9. Обновить документацию
- `AGENTS.md` — обновить структуру проекта, добавить описание трекера и env-переменных
- `docs/task-tracker-api.md` — новый файл: шаблон для записи найденных эндпоинтов, инструкция по добавлению нового tool
- `docs/development.md` — обновить секцию "Добавление нового Tool"

## Env-переменные

| Переменная | Описание | Пример |
|-----------|----------|--------|
| `TRACKER_BASE_URL` | Базовый URL трекера | `https://tracker.company.com` |
| `TRACKER_COOKIE` | Cookie из браузера | `session=abc123; token=xyz` |

## Workflow добавления новых tools

1. Открыть трекер → DevTools → Network
2. Выполнить действие (создать задачу, сменить статус и т.д.)
3. Найти запрос → Copy as cURL
4. Скинуть cURL → агент создаёт tool на основе запроса

## Валидация

- `npm run build` — компиляция без ошибок
- `npm run inspector` — в UI видны все tools и resources
- `hello` tool работает как раньше
- Без `TRACKER_BASE_URL` / `TRACKER_COOKIE` — запускается, tools трекера возвращают понятную ошибку
