import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../client/api-client.js";
import { TRACKER_LOGIN, TRACKER_PASSWORD } from "../config.js";

export function registerRefreshSessionTool(
  server: McpServer,
  client: ApiClient,
): void {
  server.tool(
    "tracker_refresh_session",
    "Re-authenticate with the tracker (refresh JWT cookie)",
    {},
    async () => {
      if (!TRACKER_LOGIN || !TRACKER_PASSWORD) {
        return {
          content: [
            {
              type: "text" as const,
              text: "TRACKER_LOGIN and TRACKER_PASSWORD environment variables are not set.",
            },
          ],
          isError: true,
        };
      }

      try {
        await client.login(TRACKER_LOGIN, TRACKER_PASSWORD);
        return {
          content: [
            {
              type: "text" as const,
              text: "Session refreshed successfully.",
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to refresh session: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
