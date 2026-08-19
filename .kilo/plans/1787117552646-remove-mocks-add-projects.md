# Plan: Удалить моки + tracker tools + нейминг

## Контекст
Удалить hello/greeting загушки. Организовать структуру для будущих интеграций (tracker, gitlab, email). Добавить два tool для трекера: список проектов и детали проекта.

## Нейминг
Префикс по системе: `tracker_`, `gitlab_`, `email_`. Без префикса — только общие (`refresh_session`).

## Шаги

### 1. Удалить моки
- Удалить `src/tools/hello.ts`
- Удалить `src/resources/greeting.ts`

### 2. Создать `src/tools/tracker/`
```
src/tools/tracker/
├── index.ts              # registerTrackerTools(server, client)
├── list-projects.ts      # tracker_list_projects
└── get-project.ts        # tracker_get_project
```

### 3. `src/tools/tracker/list-projects.ts`
Tool: `tracker_list_projects`
Endpoint: GET /api/v1/project

Параметры (все optional):
- `name` (string) — фильтр по имени проекта
- `pageSize` (number, default 20)
- `currentPage` (number, default 1)
- `fields` (string, default "name,statusId,createdAt") — поля через запятую

Реализация:
- Формирует query string из параметров
- Вызывает `client.get(path)`
- Возвращает JSON

### 4. `src/tools/tracker/get-project.ts`
Tool: `tracker_get_project`
Endpoint: GET /api/v1/project/{projectId}

Параметры:
- `projectId` (number, required) — ID проекта

Реализация:
- Вызывает `client.get(/api/v1/project/${projectId})`
- Возвращает JSON

### 5. `src/tools/tracker/index.ts`
Экспортирует `registerTrackerTools(server, client)`:
- Регистрирует `tracker_list_projects`
- Регистрирует `tracker_get_project`

### 6. Обновить `src/tools/index.ts`
- Убрать импорт `hello.ts`
- Импортировать `registerTrackerTools` из `./tracker/index.js`
- Вызвать `registerTrackerTools(server, client)`

### 7. Обновить `src/resources/index.ts`
- Убрать импорт `greeting.ts`
- Экспортировать пустую `registerAllResources(server)` (или удалить ресурсы из server.ts)

### 8. Обновить `src/server.ts`
- Убрать вызов `registerAllResources(server)` (пока нет ресурсов)

### 9. Обновить `AGENTS.md`
- Убрать упоминания hello, greeting
- Обновить структуру проекта
- Обновить Env-переменные

### 10. Обновить `docs/task-tracker-api.md`
Добавить:
- GET /api/v1/project — список проектов
- GET /api/v1/project/{id} — детали проекта
- POST /api/v1/auth/login — авторизация (уже реализовано)

## Валидация
- `npm run build` — без ошибок
- `npm run inspector` — видны: `tracker_list_projects`, `tracker_get_project`, `refresh_session`
- Нет hello/greeting
- `tracker_list_projects` возвращает реальные проекты
- `tracker_get_project(539)` возвращает детали проекта
