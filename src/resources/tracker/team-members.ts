import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../../client/api-client.js";
import { registerResourceWithTool } from "../resource-tool-factory.js";

interface TeamMember {
  id: number;
  fullNameRu: string;
  active: number;
}

interface TeamMemberOutput {
  id: number;
  fullNameRu: string;
}

export async function fetchTeamMembers(
  client: ApiClient,
): Promise<TeamMemberOutput[]> {
  const response = (await client.get(
    "/api/v1/user/roles?status=true&departments=36",
  )) as TeamMember[] | { data?: TeamMember[] };

  const members: TeamMember[] = Array.isArray(response)
    ? response
    : response?.data ?? [];

  const active = members.filter((m) => m.active === 1);

  return active.map((m) => ({
    id: m.id,
    fullNameRu: m.fullNameRu,
  }));
}

export function registerTeamMembersResource(
  server: McpServer,
  client: ApiClient,
): void {
  registerResourceWithTool(server, client, {
    name: "team-members",
    uri: "tracker://team/members",
    fetcher: fetchTeamMembers,
  });
}
