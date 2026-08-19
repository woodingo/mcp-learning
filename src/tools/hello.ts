import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerHelloTool(server: McpServer): void {
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
    }),
  );
}
