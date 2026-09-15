# Plan: tracker_get_current_user tool

## Goal

Add a standalone MCP tool `tracker_get_current_user` that returns information about the currently authenticated user (whose cookie/token is used for API access).

## API

- **Endpoint**: `GET /api/v1/user/me`
- **Auth**: Cookie-based (same as all other tools, handled by `ApiClient.ensureAuthenticated()`)
- **Parameters**: None

## Output fields

Subset of the full API response:

| Field | Type | Description |
|-------|------|-------------|
| id | number | User ID |
| fullNameRu | string | Full name (Russian) |
| fullNameEn | string | Full name (English) |
| emailPrimary | string | Work email |
| telegram | string | Telegram handle |
| phone | string | Office phone |
| mobile | string | Mobile phone |
| company | string | Company name |
| department | string | Department |
| city | string | City |
| globalRole | string | Global role (e.g. "VISOR") |
| isActive | boolean | Active status |
| employmentDate | string | Employment date (ISO) |

## Tasks

### 1. Create `src/tools/tracker/get-current-user.ts`

Standalone tool following the pattern in `get-task.ts`:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../../client/api-client.js";

interface RawCurrentUser {
  id: number;
  fullNameRu: string;
  fullNameEn: string;
  emailPrimary: string;
  telegram: string;
  phone: string;
  mobile: string;
  company: string;
  department: string;
  city: string;
  globalRole: string;
  isActive: boolean;
  employmentDate: string;
}

export function registerGetCurrentUserTool(server: McpServer, client: ApiClient): void {
  server.tool(
    "tracker_get_current_user",
    "Получить информацию о текущем залогиненном пользователе (чей токен используется для доступа к API трекера).",
    {},
    async () => {
      const raw = (await client.get("/api/v1/user/me")) as RawCurrentUser;
      const output = {
        id: raw.id,
        fullNameRu: raw.fullNameRu,
        fullNameEn: raw.fullNameEn,
        emailPrimary: raw.emailPrimary,
        telegram: raw.telegram,
        phone: raw.phone,
        mobile: raw.mobile,
        company: raw.company,
        department: raw.department,
        city: raw.city,
        globalRole: raw.globalRole,
        isActive: raw.isActive,
        employmentDate: raw.employmentDate,
      };
      return {
        content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
      };
    },
  );
}
```

### 2. Register in `src/tools/tracker/index.ts`

Add import and call `registerGetCurrentUserTool(server, client)` in `registerTrackerTools`.

### 3. Update documentation

- **AGENTS.md**: Add row to "Текущие tools" table
- **docs/task-tracker-api.md**: Add endpoint `GET /api/v1/user/me` and tool description
- **docs/architecture.md**: Add tool to the tools list if applicable

### 4. Build and verify

- `npm run build`
- `npm run inspector` — test `tracker_get_current_user` in the UI
