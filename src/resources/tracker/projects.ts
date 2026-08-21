import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../../client/api-client.js";

interface Project {
  id: number;
  name: string;
}

interface ProjectOutput {
  id: number;
  name: string;
}

export function registerProjectsResource(
  server: McpServer,
  client: ApiClient,
): void {
  server.resource(
    "projects",
    "tracker://projects",
    async (_uri, _extra) => {
      try {
        const response = (await client.get("/api/v1/project-all")) as
          | Project[]
          | { data?: Project[] };

        const projects: Project[] = Array.isArray(response)
          ? response
          : response?.data ?? [];

        const output: ProjectOutput[] = projects.map((p) => ({
          id: p.id,
          name: p.name,
        }));

        return {
          contents: [
            {
              uri: "tracker://projects",
              mimeType: "application/json",
              text: JSON.stringify(output, null, 2),
            },
          ],
        };
      } catch {
        return {
          contents: [
            {
              uri: "tracker://projects",
              mimeType: "text/plain",
              text: "Not authenticated or credentials are invalid. Use the tracker_refresh_session tool to log in, then read this resource again.",
            },
          ],
        };
      }
    },
  );
}
