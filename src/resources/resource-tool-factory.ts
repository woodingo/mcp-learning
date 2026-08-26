import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../client/api-client.js";

const AUTH_HINT =
  "Not authenticated or credentials are invalid. Use the tracker_refresh_session tool to log in, then try again.";

function deriveToolName(uri: string): string {
  const schemeEnd = uri.indexOf("://");
  const afterScheme = schemeEnd >= 0 ? uri.slice(schemeEnd + 3) : uri;
  const slug = afterScheme.replace(/\//g, "_");
  return `tracker_get_${slug}`;
}

export function registerResourceWithTool(
  server: McpServer,
  client: ApiClient,
  opts: {
    name: string;
    uri: string;
    toolName?: string;
    toolDescription?: string;
    fetcher: (client: ApiClient) => Promise<unknown>;
  },
): void {
  const toolName = opts.toolName ?? deriveToolName(opts.uri);
  const toolDescription =
    opts.toolDescription ?? `Получить ${opts.name} из трекера`;

  server.resource(opts.name, opts.uri, async (_uri, _extra) => {
    try {
      const data = await opts.fetcher(client);
      return {
        contents: [
          {
            uri: opts.uri,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch {
      return {
        contents: [
          {
            uri: opts.uri,
            mimeType: "text/plain",
            text: AUTH_HINT,
          },
        ],
      };
    }
  });

  server.tool(toolName, toolDescription, {}, async () => {
    try {
      const data = await opts.fetcher(client);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch {
      return {
        content: [
          {
            type: "text" as const,
            text: AUTH_HINT,
          },
        ],
      };
    }
  });
}
