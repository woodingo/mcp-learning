import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGreetingResource(server: McpServer): void {
  server.resource("greeting", "greeting://hello", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/plain",
        text: "Hello, World!",
      },
    ],
  }));
}
