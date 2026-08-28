# Plan: Add `get_current_time` tool

## Context

Some MCP agents don't have access to the current date. Adding a simple tool that returns the current date/time solves this. The tool is not tied to the tracker — no `tracker_` prefix, no `ApiClient` dependency.

## Changes

### 1. Create `src/tools/get-current-time.ts`

- Tool name: `get_current_time`
- No parameters
- Returns: current date/time in ISO 8601 format + human-readable form (timezone from server)
- Signature: `registerGetCurrentTimeTool(server: McpServer)` — no `client` param

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGetCurrentTimeTool(server: McpServer): void {
  server.tool(
    "get_current_time",
    "Получить текущую дату и время сервера. Возвращает ISO 8601 и читаемый формат.",
    {},
    async () => {
      const now = new Date();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              iso: now.toISOString(),
              local: now.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }),
              timezone: "Europe/Moscow",
            }, null, 2),
          },
        ],
      };
    },
  );
}
```

### 2. Update `src/tools/index.ts`

- Import `registerGetCurrentTimeTool`
- Call it in `registerAllTools` (before tracker tools, no client needed)

### 3. Update documentation

| File | Change |
|------|--------|
| `AGENTS.md` | Add `get_current_time` to tools table |
| `docs/architecture.md` | Add `get-current-time.ts` to file tree |
| `docs/task-tracker-api.md` | Add row to tools table (or note it's non-tracker) |

## Validation

- `npm run build` — must compile without errors
- `npm run inspector` — verify `get_current_time` appears in tools list and returns current time
