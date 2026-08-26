import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../../client/api-client.js";
import { registerResourceWithTool } from "../resource-tool-factory.js";

interface Project {
  id: number;
  name: string;
}

interface ProjectOutput {
  id: number;
  name: string;
}

export async function fetchProjects(client: ApiClient): Promise<ProjectOutput[]> {
  const response = (await client.get("/api/v1/project-all")) as
    | Project[]
    | { data?: Project[] };

  const projects: Project[] = Array.isArray(response)
    ? response
    : response?.data ?? [];

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
  }));
}

export function registerProjectsResource(
  server: McpServer,
  client: ApiClient,
): void {
  registerResourceWithTool(server, client, {
    name: "projects",
    uri: "tracker://projects",
    fetcher: fetchProjects,
  });
}
