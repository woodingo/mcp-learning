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

export function registerGetCurrentUserTool(
  server: McpServer,
  client: ApiClient,
): void {
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
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(output, null, 2),
          },
        ],
      };
    },
  );
}
