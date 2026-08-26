# Plan: tracker_transfer_task tool

## Context

User wants a new MCP tool to transfer (update) a task's performer and status via `PUT api/v1/project/{projectId}/task/{taskId}`. The tool needs human-readable status names so the agent doesn't need to know raw IDs.

## Changes

### 1. Add `put()` method to ApiClient

**File:** `src/client/api-client.ts`

Add `put` method alongside existing `get`, `post`, `patch`:

```typescript
put(path: string, body?: unknown): Promise<unknown> {
  return this.request("PUT", path, body);
}
```

### 2. Create tool file

**File:** `src/tools/tracker/transfer-task.ts`

- Tool name: `tracker_transfer_task`
- Description: "Перевести задачу в новый статус и/или назначить исполнителя"
- Parameters (all required):
  - `projectId` — `z.number()`, "ID проекта"
  - `taskId` — `z.number()`, "ID задачи"
  - `performerId` — `z.number()`, "ID нового исполнителя (0 = без исполнителя)"
  - `status` — `z.enum(["New", "Develop", "Code Review", "QA", "Done"])`, human-readable status name
- Status → statusId mapping: `{ New: 1, Develop: 2, "Code Review": 4, QA: 6, Done: 8 }`
- API call: `client.put(\`/api/v1/project/${projectId}/task/${taskId}\`, { id: taskId, performerId, statusId })`
- Response: array with one task DTO → extract first element, return formatted result with key fields (id, name, status, performer, project, url)

### 3. Register tool

**File:** `src/tools/tracker/index.ts`

Import and call `registerTransferTaskTool(server, client)`.

### 4. Update documentation

**Files:** `docs/task-tracker-api.md`, `docs/architecture.md`, `AGENTS.md`

- Add `tracker_transfer_task` to tools table
- Add endpoint documentation for `PUT /api/v1/project/{projectId}/task/{taskId}`
- Add `transfer-task.ts` to file tree in architecture.md

## Validation

- `npm run build` — must compile without errors
- `npm run inspector` — test tool manually with valid project/task IDs
