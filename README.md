# MCP Learning Server

MCP-сервер (Model Context Protocol) для корпоративного трекера задач. Поддерживает два режима: stdio (локальная разработка) и HTTP (сетевой доступ).

## Предварительные требования

- **Node.js** v22+
- Доступ к трекеру задач (URL, логин, пароль)

## Быстрый старт

```bash
# 1. Клонируйте репозиторий
git clone git@github.com:woodingo/mcp-learning.git
cd mcp-learning

# 2. Установите зависимости
npm install

# 3. Создайте .env файл и заполните своими данными
cp .env.example .env

# 4. Скомпилируйте
npm run build

# 5. Запустите (stdio режим)
npm start
```

## Настройка `.env`

Скопируйте `.env.example` в `.env` и заполните значениями:

| Переменная | Описание | Пример |
|-----------|----------|--------|
| `TRACKER_BASE_URL` | Базовый URL трекера | `http://track.nordclan` |
| `TRACKER_LOGIN` | Ваш логин в трекере | `ivan.petrov` |
| `TRACKER_PASSWORD` | Ваш пароль | `***` |
| `TRACKER_USER_ID` | Ваш ID в трекере (число) | `336` |
| `MCP_API_KEY` | API-ключ для HTTP-режима | `my-secret-key` |
| `MCP_PORT` | Порт HTTP-сервера | `3000` |
| `MCP_HOST` | Хост HTTP-сервера | `0.0.0.0` |

## Режимы запуска

| Команда | Режим | Описание |
|---------|-------|----------|
| `npm start` | stdio | Локальная разработка, Claude Desktop |
| `npm run start:http` | HTTP | Сетевой доступ (порт из `MCP_PORT`) |
| `npm run inspector` | — | Веб-UI для тестирования tools/resources |

## Сборка и деплой

```bash
# Компиляция
npm run build

# Деплой как systemd сервис (Linux)
# 1. Отредактируйте mcp-server.service — подставьте свои пути
# 2. Скопируйте в /etc/systemd/system/
sudo cp mcp-server.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mcp-server
```

См. [docs/systemd-service.md](docs/systemd-service.md) для подробной настройки автозапуска.

## Документация

- [Архитектура проекта](docs/architecture.md) — стек, структура файлов
- [Разработка](docs/development.md) — добавление tools/resources
- [Task Tracker API](docs/task-tracker-api.md) — эндпоинты трекера
- [MCP Inspector](docs/mcp-inspector.md) — веб-интерфейс для тестирования
- [Systemd Service](docs/systemd-service.md) — автозапуск в Debian/Ubuntu
