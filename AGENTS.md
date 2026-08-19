# AGENTS.md — Навигация для агентов

## О проекте

MCP-сервер на Node.js + TypeScript. Реализует протокол Model Context Protocol (MCP) с tools для корпоративного трекера задач (`tracker_list_projects`, `tracker_get_project`, `tracker_refresh_session`). Использует stdio-транспорт.

## Структура проекта

```
mcp-learning/
├── src/
│   ├── index.ts                # Точка входа: main()
│   ├── server.ts               # Создание McpServer, подключение транспорта
│   ├── config.ts               # TRACKER_BASE_URL, TRACKER_LOGIN, TRACKER_PASSWORD из env
│   ├── client/
│   │   └── api-client.ts       # HTTP-клиент с cookie-авторизацией
│   ├── tools/
│   │   ├── index.ts            # registerAllTools(server, client)
│   │   ├── refresh-session.ts  # Tool: tracker_refresh_session
│   │   └── tracker/
│   │       ├── index.ts        # registerTrackerTools(server, client)
│   │       ├── list-projects.ts # Tool: tracker_list_projects
│   │       └── get-project.ts  # Tool: tracker_get_project
│   └── resources/
│       └── index.ts            # registerAllResources(server) — заглушка
├── build/                      # Скомпилированный JS (сгенерирован tsc)
├── docs/
│   ├── architecture.md         # Архитектура и структура
│   ├── development.md          # Разработка и добавление компонентов
│   ├── task-tracker-api.md     # Документация API трекера и шаблоны tools
│   ├── mcp-inspector.md        # Использование веб-UI Inspector
│   └── systemd-service.md      # Настройка автозапуска в Debian
├── package.json
├── tsconfig.json
└── mcp-server.service          # Systemd unit файл
```

## Ключевые команды

| Команда | Описание |
|---------|----------|
| `npm install` | Установка зависимостей |
| `npm run build` | Компиляция TypeScript |
| `npm start` | Запуск сервера (stdio) |
| `npm run inspector` | Запуск веб-UI для тестирования |

## Документация

- [Архитектура проекта](docs/architecture.md) — стек, структура файлов, схема взаимодействия
- [Разработка](docs/development.md) — установка, команды, добавление tools/resources
- [Task Tracker API](docs/task-tracker-api.md) — эндпоинты трекера, шаблоны для новых tools
- [MCP Inspector](docs/mcp-inspector.md) — веб-интерфейс для визуального тестирования
- [Systemd Service](docs/systemd-service.md) — автозапуск в Debian/Ubuntu

## Технологии

- **Node.js** v22+ (runtime)
- **TypeScript** ^7.0.2 (ES2022 target, NodeNext modules)
- **MCP SDK** ^1.30.0 (`@modelcontextprotocol/sdk`)
- **Zod** — валидация параметров tools (транзитивная зависимость SDK)

## Env-переменные

| Переменная | Описание | Пример |
|-----------|----------|--------|
| `TRACKER_BASE_URL` | Базовый URL трекера | `http://track.nordclan` |
| `TRACKER_LOGIN` | Логин | `andrew.yudin` |
| `TRACKER_PASSWORD` | Пароль | `***` |

## Добавление нового Tool

1. Создайте файл `src/tools/tracker/my-tool.ts` с функцией `registerMyTool(server, client)`
2. Зарегистрируйте в `src/tools/tracker/index.ts`
3. `npm run build` — перекомпилируйте
4. `npm run inspector` — проверьте в UI

Подробнее: [docs/development.md](docs/development.md), [docs/task-tracker-api.md](docs/task-tracker-api.md)
