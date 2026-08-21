# Plan: Resource tracker://tasks/my — мои задачи в agent-friendly формате

## Контекст

Добавить MCP resource `tracker://tasks/my`, который возвращает задачи текущего пользователя, сгруппированные по колонкам доски. Формат — упрощённый, agent-friendly. Удалить tool `tracker_list_tasks` — он заменяется resource. Улучшить `ApiClient` с auto-login при необходимости.

## Изменения в ApiClient — auto-login

Текущее поведение `request()`:
- Нет куки → бросает ошибку
- 401 от API → бросает ошибку

Новое поведение:
- Нет куки → автоматически логинится (credentials из env)
- 401 от API → очищает куку, перелогинивается, **повторяет запрос один раз**
- Логин не удался (нет credentials / неверные) → бросает ошибку

### Изменения в `src/client/api-client.ts`

1. Добавить приватное поле `credentials: { login: string; password: string } | null = null`
2. Добавить метод `setCredentials(login: string, password: string)` — сохраняет credentials
3. Добавить метод `ensureAuthenticated()`:
   - Если `this.cookie` есть → return (уже авторизован)
   - Если `this.credentials` есть → вызывает `this.login(login, password)`
   - Если credentials нет → бросает ошибку "Not authenticated. Call the tracker_refresh_session tool to log in."
4. Изменить `request()`:
   - Вызвать `await this.ensureAuthenticated()` вместо проверки `if (!this.cookie)`
   - Вынести fetch в приватный `rawFetch(method, path, body): Promise<Response>`
   - Если `rawFetch` вернул401 и есть `credentials` → `this.cookie = ""`, `ensureAuthenticated()`, повторить `rawFetch`
   - Если401 и нет credentials → бросить ошибку
   - Если другой не-OK → бросить ошибку как раньше

### Изменения в `src/server.ts`

```typescript
const client = new ApiClient(TRACKER_BASE_URL, "");
if (TRACKER_LOGIN && TRACKER_PASSWORD) {
  client.setCredentials(TRACKER_LOGIN, TRACKER_PASSWORD);
  // Убрать fire-and-forget login() — клиент сам авторизуется при первом запросе
}
```

## Данные из API

API трекера (`GET /api/v1/task`) возвращает вложенные объекты автоматически (без указания в `fields`):
- `project.name` — полное название проекта (например "Tutu.ru | kitBot")
- `author.fullNameRu` — ФИО автора на русском
- `prioritiesId` — число 1–5 (1 = highest, 5 = lowest)
- `description` — описание задачи (HTML)
- `statusId` — статус задачи

Указывать `fields` не нужно — без параметра API вернёт все поля включая вложенные объекты.

## Приоритеты → человекочитаемые названия

| prioritiesId | Название |
|-------------|----------|
| 1 | critical |
| 2 | high |
| 3 | medium |
| 4 | low |
| 5 | lowest |

## Статусы → колонки доски

| statusId | Техническое имя | Колонка доски |
|----------|----------------|---------------|
| 1 | New | New |
| 2 | Develop play | Develop |
| 3 | Develop stop | Develop |
| 4 | Code Review play | Code Review |
| 5 | Code Review stop | Code Review |
| 6 | QA play | QA |
| 7 | QA stop | QA |
| 8 | Done | Done |
| 9 | Canceled | **исключить** |
| 10 | Closed | **исключить** |

## Формат ответа resource

```json
{
  "New": [
    {
      "id": 102545,
      "name": "Front. Баги после тестирования",
      "description": "Айдишник подставляется после выбора родительской статьи...",
      "project": "Tutu.ru | kitBot",
      "priority": "high",
      "author": "Екатерина Артамонова"
    }
  ],
  "Develop": [],
  "Code Review": [],
  "QA": [],
  "Done": []
}
```

Поля на задачу:
- `id` — номер задачи
- `name` — название
- `description` — описание (strip HTML)
- `project` — полное название проекта (`task.project.name`)
- `priority` — строка: critical / high / medium / low / lowest (`task.prioritiesId`)
- `author` — ФИО автора (`task.author.fullNameRu`)

## Обработка ошибок в resource

Resource callback проще благодаря auto-login в `ApiClient`:
1. Вызвать `client.get("/api/v1/task?isOnlyMine=true")`
2. Обработать данные (маппинг, фильтрация, группировка)
3. Вернуть JSON

В catch:
- Если `client.get()` бросил ошибку → значит credentials не настроены или неверны
- Вернуть текст: `"Not authenticated or credentials are invalid. Use the tracker_refresh_session tool to log in, then read this resource again."`

Auto-login + retry на401 происходит внутри `ApiClient` — resource не знает об этом.

## Шаги

### 1. Обновить `src/client/api-client.ts`

- Добавить поле `credentials: { login: string; password: string } | null = null`
- Добавить `setCredentials(login, password)`
- Добавить `ensureAuthenticated()` — логинится если нужно
- Рефакторить `request()`:
  - `ensureAuthenticated()` вместо `if (!this.cookie)`
  - Вынести fetch в `rawFetch()`
  - При401 → очистить куку, `ensureAuthenticated()`, retry `rawFetch()` один раз

### 2. Обновить `src/server.ts`

- Убрать fire-and-forget `client.login()`
- Добавить `client.setCredentials(TRACKER_LOGIN, TRACKER_PASSWORD)`
- Добавить `registerAllResources(server, client)`

### 3. Удалить `src/tools/tracker/list-tasks.ts`

Удалить файл.

### 4. Обновить `src/tools/tracker/index.ts`

Удалить импорт и вызов `registerTrackerListTasks`.

### 5. Создать `src/resources/tracker/my-tasks.ts`

- Resource URI: `tracker://tasks/my`
- Логика:
  - `client.get("/api/v1/task?isOnlyMine=true")`
  - Маппинг statusId → колонка доски (New, Develop, Code Review, QA, Done)
  - Маппинг prioritiesId → строка (1=critical, 2=high, 3=medium, 4=low, 5=lowest)
  - Фильтрация: исключить statusId 9 (Canceled) и 10 (Closed)
  - Strip HTML из description
  - Группировка по колонкам
- В catch: текст с инструкцией вызвать `tracker_refresh_session`

### 6. Создать `src/resources/tracker/index.ts`

`registerTrackerResources(server, client)` → `registerMyTasksResource(server, client)`

### 7. Обновить `src/resources/index.ts`

Добавить параметр `client: ApiClient`, вызвать `registerTrackerResources`.

## Структура файлов после реализации

```
src/client/
└── api-client.ts               # auto-login, retry на401

src/tools/tracker/
├── index.ts                    # без list-tasks
├── list-projects.ts
└── get-project.ts

src/resources/
├── index.ts
└── tracker/
    ├── index.ts
    └── my-tasks.ts             # Resource: tracker://tasks/my
```

## Валидация

- `npm run build` — компиляция без ошибок
- `npm run inspector` — в resources виден `tracker://tasks/my`, в tools НЕТ `tracker_list_tasks`
- Чтение resource возвращает JSON с 5 колонками
- Задачи со statusId 9 и 10 отсутствуют
- У каждой задачи: id, name, description, project (полное название), priority (critical/high/medium/low/lowest), author (ФИО)
- При отсутствии/истечении куки клиент автоматически перелогинивается
- Только если credentials не настроены — resource возвращает текст с инструкцией
