import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../client/api-client.js";
import { registerHelloTool } from "./hello.js";
import { registerRefreshSessionTool } from "./refresh-session.js";

export function registerAllTools(
  server: McpServer,
  client: ApiClient,
): void {
  registerHelloTool(server);
  registerRefreshSessionTool(server, client);
}
