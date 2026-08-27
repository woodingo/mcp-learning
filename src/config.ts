import "dotenv/config";

export const TRACKER_BASE_URL = process.env.TRACKER_BASE_URL ?? "";
export const TRACKER_LOGIN = process.env.TRACKER_LOGIN ?? "";
export const TRACKER_PASSWORD = process.env.TRACKER_PASSWORD ?? "";

export const MCP_API_KEY = process.env.MCP_API_KEY ?? "";
export const TRACKER_USER_ID = Number(process.env.TRACKER_USER_ID ?? 0);

export const MCP_PORT = Number(process.env.MCP_PORT ?? 3000);
export const MCP_HOST = process.env.MCP_HOST ?? "0.0.0.0";
