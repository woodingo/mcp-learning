# Plan: tracker_get_task + shared task DTO

## Goal

1. Add `tracker_get_task` standalone tool (param: `taskId`) calling `GET /api/v1/project/1373/task/{taskId}`
2. Extract reusable human-readable task DTO into a shared module
3. Refactor existing code (my-tasks, create-task, transfer-task) to use shared DTO
4. Add `parentId` to the DTO

## Design Decisions

### projectId parameter

The API endpoint requires projectId in the path. `projectId` is a required parameter of the tool (user confirmed). The tool description will note that projectId can be obtained from the task URL or from my-tasks resource.

### Shared DTO location

`src/resources/tracker/task-dto.ts` — placed in resources/tracker because the DTO mapping logic originates from my-tasks.ts (a resource file). Both resources and tools will import from here.

### DTO fields

Based on the API response example and existing my-tasks DTO. The "human-readable" format means: priority as string, author/performer as names (not IDs), project as name, URL constructed, description stripped of HTML.

```typescript
interface TaskOutput {
  id: number;
  name: string;
  type: string;           // typeId → "task" | "bug"
  status: string;         // statusId → "New" | "Develop" | "Code Review" | "QA" | "Done" | "Canceled" | "Closed"
  description: string;    // HTML stripped
  priority: string;       // prioritiesId → "critical" | "high" | "medium" | "low" | "lowest"
  performer: string;      // performer.fullNameRu
  author: string;         // author.fullNameRu
  project: string;        // project.name
  parentId: number | null; // NEW — parent task ID
  url: string;            // constructed from projectId + id
  createdAt: string;
}
```

### Shared mappings to extract

```typescript
// task-dto.ts exports:
export const STATUS_MAP: Record<number, string>      // statusId → label (output)
export const PRIORITY_MAP: Record<number, string>    // prioritiesId → label (output)
export const TYPE_MAP: Record<number, string>        // typeId → label (output)
export function stripHtml(html: string): string
export function buildTaskUrl(projectId: number, taskId: number): string
export function toTaskOutput(raw: RawTask): TaskOutput
```

Note: transfer-task.ts has its own inverse `STATUS_MAP` (label → statusId) for input parameters. This stays in transfer-task.ts — it's a different concern (input mapping vs output mapping).

## Tasks

### 1. Create `src/resources/tracker/task-dto.ts`

- Define `RawTask` interface (matches API response shape — partial fields)
- Define `TaskOutput` interface (human-readable)
- Export `STATUS_MAP`, `PRIORITY_MAP`, `TYPE_MAP`, `stripHtml`, `buildTaskUrl`, `toTaskOutput`
- `toTaskOutput` maps all fields, strips HTML from description, resolves status/priority/type to human strings

### 2. Create `src/tools/tracker/get-task.ts`

- Register `tracker_get_task` tool
- Params: `taskId` (z.number()), `projectId` (z.number())
- Description: "Получить детальную информацию о задаче. В списке моих задач возвращаются не все задачи, над которыми я работаю — некоторые могут быть назначены на других исполнителей. Также этот инструмент полезен для получения информации о родительской задаче."
- Call `GET /api/v1/project/{projectId}/task/{taskId}`
- Map response through `toTaskOutput()`
- Return JSON of TaskOutput

### 3. Register in `src/tools/tracker/index.ts`

- Import and call `registerGetTaskTool(server, client)`

### 4. Refactor `src/resources/tracker/my-tasks.ts`

- Remove local `STATUS_TO_COLUMN`, `PRIORITY_MAP`, `stripHtml`, `Task`, `TaskOutput` interfaces
- Import `PRIORITY_MAP`, `stripHtml`, `buildTaskUrl`, `TaskOutput` from `task-dto.ts`
- `fetchMyTasks` still groups by column (New/Develop/etc), but uses shared mappings for priority/description/url
- Keep column grouping logic local (it's specific to my-tasks view — merges play/stop statuses)
- Note: my-tasks uses a list endpoint with limited fields (no performer/author objects), so mapping is simpler — just use shared helpers, not full `toTaskOutput()`

### 5. Refactor `src/tools/tracker/create-task.ts`

- After creation, map result through `toTaskOutput()` instead of returning raw JSON
- Import `toTaskOutput` from task-dto.ts
- Note: create-task response shape should match get-task shape (same API entity)

### 6. Refactor `src/tools/tracker/transfer-task.ts`

- Keep local inverse `STATUS_MAP` (label → statusId) for input — this is a different concern
- After transfer, map result through `toTaskOutput()` instead of manual field extraction
- Import `toTaskOutput` from task-dto.ts
- Unwrap array: `const task = Array.isArray(result) ? result[0] : result`

### 7. Update documentation

- `docs/task-tracker-api.md`: Add `tracker_get_task` row in tools table, add endpoint docs
- `docs/architecture.md`: Add `tracker_get_task` to tools table, add `task-dto.ts` to file structure
- `AGENTS.md`: Add `tracker_get_task` to tools table, add `task-dto.ts` to file structure

## File changes summary

| File | Action |
|------|--------|
| `src/resources/tracker/task-dto.ts` | **CREATE** — shared DTO, mappings, toTaskOutput() |
| `src/tools/tracker/get-task.ts` | **CREATE** — tracker_get_task tool |
| `src/tools/tracker/index.ts` | EDIT — register get-task |
| `src/resources/tracker/my-tasks.ts` | EDIT — use shared DTO |
| `src/tools/tracker/create-task.ts` | EDIT — use toTaskOutput() |
| `src/tools/tracker/transfer-task.ts` | EDIT — use toTaskOutput() |
| `docs/task-tracker-api.md` | EDIT — add endpoint + tool docs |
| `docs/architecture.md` | EDIT — update tables |
| `AGENTS.md` | EDIT — update tables |

## Validation

1. `npm run build` — must compile without errors
2. `npm run inspector` — verify `tracker_get_task` appears, call it with a known taskId
3. Verify `tracker_get_tasks_my` still works (refactored)
4. Verify `tracker_create_task` returns human-readable output (refactored)
5. Verify `tracker_transfer_task` returns human-readable output (refactored)
