# Plan: Add createdAt to my-tasks resource

## Context

The `tracker://tasks/my` MCP resource currently returns: id, name, description, project, priority, author, url. The user wants to add the task creation date. The tracker API supports `createdAt` as a field (confirmed in project endpoint docs). The task endpoint uses a `fields` query parameter to select returned fields.

## Changes

### File: `src/resources/tracker/my-tasks.ts`

1. **Add `createdAt` to `TASK_FIELDS` string** (line 60):
   - Current: `"id,name,statusId,prioritiesId,description,projectId,prefix,factExecutionTime,plannedExecutionTime,sprintId,typeId"`
   - Add `createdAt` to the list

2. **Add `createdAt` to `Task` interface** (line 29):
   - Add `createdAt?: string;`

3. **Add `createdAt` to `TaskOutput` interface** (line 40):
   - Add `createdAt: string;`

4. **Map `createdAt` in task processing loop** (line 82):
   - Add `createdAt: task.createdAt ?? ""` to the output object

## Validation

- `npm run build` — compile TypeScript
- `npm run inspector` — verify the resource returns `createdAt` field in the JSON output
