import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../../client/api-client.js";

interface TeamMember {
  id: number;
  fullNameRu: string;
  active: number;
}

interface TeamMemberOutput {
  id: number;
  fullNameRu: string;
}

export function registerTeamMembersResource(
  server: McpServer,
  client: ApiClient,
): void {
  server.resource(
    "team-members",
    "tracker://team/members",
    async (_uri, _extra) => {
      try {
        const response = (await client.get("/api/v1/user/roles?status=true&departments=36")) as
          | TeamMember[]
          | { data?: TeamMember[] };

        const members: TeamMember[] = Array.isArray(response)
          ? response
          : response?.data ?? [];

        const active = members.filter((m) => m.active === 1);

        const output: TeamMemberOutput[] = active.map((m) => ({
          id: m.id,
          fullNameRu: m.fullNameRu,
        }));

        return {
          contents: [
            {
              uri: "tracker://team/members",
              mimeType: "application/json",
              text: JSON.stringify(output, null, 2),
            },
          ],
        };
      } catch {
        return {
          contents: [
            {
              uri: "tracker://team/members",
              mimeType: "text/plain",
              text: "Not authenticated or credentials are invalid. Use the tracker_refresh_session tool to log in, then read this resource again.",
            },
          ],
        };
      }
    },
  );
}
