# AGENTS.md — Навигация для агентов

## О проекте

MCP-сервер на Node.js + TypeScript. Реализует протокол Model Context Protocol (MCP) с одним tool (`hello`) и одним resource (`greeting://hello`). Использует stdio-транспорт.

## Структура проекта

```
mcp-learning/
├── src/index.ts              # MCP-сервер (вся логика)
├── build/index.js            # Скомпилированный JS
├── docs/
│   ├── architecture.md       # Архитектура и структура
│   ├── development.md        # Разработка и добавление компонентов
│   ├── mcp-inspector.md      # Использование веб-UI Inspector
│   └── systemd-service.md    # Настройка автозапуска в Debian
├── package.json
├── tsconfig.json
└── mcp-server.service        # Systemd unit файл
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
- [MCP Inspector](docs/mcp-inspector.md) — веб-интерфейс для визуального тестирования
- [Systemd Service](docs/systemd-service.md) — автозапуск в Debian/Ubuntu

## Технологии

- **Node.js** v22+ (runtime)
- **TypeScript** ^7.0.2 (ES2022 target, NodeNext modules)
- **MCP SDK** ^1.30.0 (`@modelcontextprotocol/sdk`)
- **Zod** — валидация параметров tools (транзитивная зависимость SDK)

## Добавление нового Tool

1. Откройте `src/index.ts`
2. Добавьте вызов `server.tool("name", { params }, handler)`
3. `npm run build` — перекомпилируйте
4. `npm run inspector` — проверьте в UI

Подробнее: [docs/development.md](docs/development.md)
