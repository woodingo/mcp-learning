# AGENTS.md — Навигация для агентов

## О проекте

MCP-сервер на Node.js + TypeScript. Реализует протокол Model Context Protocol (MCP) с tools для корпоративного трекера задач. Два режима: stdio для локальной разработки, HTTP для сетевого доступа.

Каждый ресурс (tracker://tasks/my, tracker://projects, tracker://team/members) автоматически дублируется как tool через фабрику `registerResourceWithTool()` — это необходимо, т.к. некоторые клиенты (LibreChat) не поддерживают ресурсы.

## Структура проекта

```
mcp-learning/
├── src/
│   ├── index.ts                # Точка входа: main() — stdio режим
│   ├── http.ts                 # Точка входа: HTTP режим с API-ключом
│   ├── server.ts               # Создание McpServer, подключение транспорта
│   ├── config.ts               # TRACKER_BASE_URL, TRACKER_LOGIN, TRACKER_PASSWORD, MCP_API_KEY из env
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
| `npm run start:http` | Запуск HTTP-сервера (порт 3000) |
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
| `MCP_API_KEY` | API-ключ для HTTP-режима | `my-secret-key` |
| `MCP_PORT` | Порт HTTP-сервера | `3000` |
| `MCP_HOST` | Хост HTTP-сервера | `0.0.0.0` |

## Текущие tools

| Tool | Источник | Описание |
|------|----------|----------|
| `tracker_get_tasks_my` | resource factory | Мои задачи по колонкам доски |
| `tracker_get_projects` | resource factory | Список всех проектов |
| `tracker_get_team_members` | resource factory | Участники команды |
| `tracker_create_task` | standalone tool | Создание задачи |

## Добавление нового Tool

1. Создайте файл `src/tools/tracker/my-tool.ts` с функцией `registerMyTool(server, client)`
2. Зарегистрируйте в `src/tools/tracker/index.ts`
3. `npm run build` — перекомпилируйте
4. `npm run inspector` — проверьте в UI
5. **Обновите документацию** (docs/task-tracker-api.md, docs/architecture.md, AGENTS.md)

Подробнее: [docs/development.md](docs/development.md), [docs/task-tracker-api.md](docs/task-tracker-api.md)

## Добавление нового Resource + Tool

1. Создайте файл `src/resources/tracker/my-data.ts` с fetcher + `registerMyDataResource()`
2. Зарегистрируйте в `src/resources/tracker/index.ts`
3. `npm run build` — перекомпилируйте
4. `npm run inspector` — проверьте в UI
5. **Обновите документацию** (docs/task-tracker-api.md, docs/architecture.md, AGENTS.md)

Подробнее: [docs/development.md](docs/development.md)

## Правило обновления документации

**При добавлении или изменении логики (tools, resources, API-эндпоинтов, архитектуры) необходимо обновлять документацию:**

| Что изменилось | Какие файлы обновлять |
|----------------|----------------------|
| Новый tool / resource | `docs/architecture.md`, `docs/task-tracker-api.md`, `AGENTS.md` |
| Новый API-эндпоинт трекера | `docs/task-tracker-api.md` |
| Изменение архитектуры | `docs/architecture.md` |
| Новая команда / env-переменная | `docs/development.md`, `AGENTS.md` |
| Фабрика / паттерн регистрации | `docs/development.md` |
