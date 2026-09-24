# Добавить parentId в tracker_create_task

## Контекст

Инструмент `tracker_create_task` (`src/tools/tracker/create-task.ts:10`) не принимает `parentId` — параметр отсутствует в zod-схеме и в POST body. При этом:
- API трекера принимает `parentId` в POST body при создании задачи
- DTO (`src/resources/tracker/task-dto.ts:12`) уже содержит `parentId` в `RawTask` и возвращает его в `TaskOutput`

## Изменения

### 1. `src/tools/tracker/create-task.ts`

- Добавить в zod-схему опциональный параметр:
  ```typescript
  parentId: z.number().optional().describe("ID родительской задачи (для подзадач)"),
  ```
- Добавить `parentId` в POST body:
  ```typescript
  parentId: parentId ?? null,
  ```

### 2. `docs/task-tracker-api.md`

- Добавить `parentId` в таблицу Request body эндпоинта создания задачи (~строка 87):
  ```
  | `parentId` | number | ID родительской задачи (необязательно) |
  ```

### 3. Функция-обёртка в MCP (tool description)

- В описании tool (опционально) упомянуть что можно создавать подзадачи через parentId.

## Валидация

1. `npm run build` — компиляция без ошибок
2. `npm run inspector` — проверить что `parentId` появился в схеме tool
3. Создать задачу без `parentId` — должна создаться как раньше
4. Создать задачу с `parentId` — должна стать подзадачей указанной задачи