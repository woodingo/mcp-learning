# Plan: Add `tracker_log_time` tool

## Goal

Add a standalone MCP tool for logging time on a task via `POST /api/v1/timesheet`.

## API

**POST** `/api/v1/timesheet`

Request body (from user-provided example):
```json
{
  "isDraft": false,
  "taskId": 102873,
  "typeId": "1",
  "spentTime": 8,
  "onDate": "2026-08-27",
  "projectId": 1373,
  "sprintId": null
}
```

User-facing parameters: `taskId`, `projectId`, `onDate` (YYYY-MM-DD), `spentTime` (number, hours).
Hardcoded defaults: `isDraft=false`, `typeId="1"`, `sprintId=null`.

## Steps

### 1. Create `src/tools/tracker/log-time.ts`

New file following the pattern of `create-task.ts`:

- Tool name: `tracker_log_time`
- Description: "Списать время на задачу в трекере"
- Zod params:
  - `taskId: z.number()` — ID задачи
  - `projectId: z.number()` — ID проекта
  - `onDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)` — дата (YYYY-MM-DD)
  - `spentTime: z.number()` — затраченное время в часах
- Body sent to API:
  ```ts
  { isDraft: false, taskId, typeId: "1", spentTime, onDate, projectId, sprintId: null }
  ```
- Use `client.post("/api/v1/timesheet", body)`
- Return success message with the posted data echoed back

### 2. Register in `src/tools/tracker/index.ts`

- Import `registerLogTimeTool` from `./log-time.js`
- Call `registerLogTimeTool(server, client)` in `registerTrackerTools()`

### 3. Update documentation

- **`docs/task-tracker-api.md`**: Add row to tools table, add endpoint section for POST `/api/v1/timesheet`
- **`docs/architecture.md`**: Add row to tools table
- **`AGENTS.md`**: Add row to tools table

### 4. Build and verify

- `npm run build`
- `npm run inspector` — test the tool
