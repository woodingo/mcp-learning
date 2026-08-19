import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGreetingResource } from "./greeting.js";

export function registerAllResources(server: McpServer): void {
  registerGreetingResource(server);
}
