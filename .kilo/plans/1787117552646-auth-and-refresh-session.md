# Plan: Авторизация и tool refresh_session

## Контекст

Корпоративный трекер `http://track.nordclan`. Авторизация — POST на `/api/v1/auth/login` с JSON `{login, password}`. Ответ содержит JWT-токен в cookie `authorization=Basic%20{JWT}` и в JSON-поле `token`. Срок жизни — 7 дней.

Нужно добавить tool `refresh_session`, чтобы агент мог перелогиниться при получении 401.

## Схема работы

```
Agent → list_tasks() → Tracker → 401 → "Сессия истекла"
Agent → refresh_session() → POST /api/v1/auth/login → новая cookie
Agent → list_tasks() (retry) → Tracker → 200 OK → данные
```

## Шаги реализации

### 1. Добавить dotenv
- `npm install dotenv`
- Добавить `"start": "node -r dotenv/config build/index.js"` в package.json scripts

### 2. Создать `.env.example`
```
TRACKER_BASE_URL=http://track.nordclan
TRACKER_LOGIN=your_login
TRACKER_PASSWORD=your_password
```

### 3. Обновить `src/config.ts`
Добавить:
```typescript
export const TRACKER_LOGIN = process.env.TRACKER_LOGIN ?? "";
export const TRACKER_PASSWORD = process.env.TRACKER_PASSWORD ?? "";
```

### 4. Обновить `src/client/api-client.ts`
Добавить метод `login(login: string, password: string)`:
- POST `/api/v1/auth/login` с body `{login, password}`
- Извлечь cookie из `response.headers.getSetCookie()` (Node 22+)
- Найти cookie с именем `authorization`
- Сохранить в `this.cookie`

Добавить публичный геттер `isAuthenticated()`:
- Возвращает `true` если cookie не пустая

### 5. Создать `src/tools/refresh-session.ts`
Экспортировать `registerRefreshSessionTool(server, client)`:
- Tool name: `refresh_session`
- Без параметров
- Вызывает `client.login(TRACKER_LOGIN, TRACKER_PASSWORD)`
- Возвращает "Сессия обновлена" или ошибку

### 6. Обновить `src/tools/index.ts`
Импортировать и вызвать `registerRefreshSessionTool(server, client)`

### 7. Обновить документацию
- `AGENTS.md` — добавить refresh_session в описание tools
- `docs/task-tracker-api.md` — добавить описание эндпоинта авторизации

## Env-переменные

| Переменная | Описание | Пример |
|-----------|----------|--------|
| `TRACKER_BASE_URL` | Базовый URL трекера | `http://track.nordclan` |
| `TRACKER_LOGIN` | Логин | `andrew.yudin` |
| `TRACKER_PASSWORD` | Пароль | `***` |

## Валидация
- `npm run build` — компиляция без ошибок
- `npm run inspector` — виден tool `refresh_session`
- Вызов `refresh_session` → cookie обновляется
- Повторный вызов tracker tool → запрос идёт с новой cookie
