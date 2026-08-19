import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "mcp-learning",
  version: "1.0.0",
});

server.tool(
  "hello",
  { name: z.string().optional().describe("Name to greet") },
  async ({ name }) => ({
    content: [
      {
        type: "text" as const,
        text: `Hello, ${name ?? "World"}!`,
      },
    ],
  })
);

server.resource("greeting", "greeting://hello", async (uri) => ({
  contents: [
    {
      uri: uri.href,
      mimeType: "text/plain",
      text: "Hello, World!",
    },
  ],
}));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
