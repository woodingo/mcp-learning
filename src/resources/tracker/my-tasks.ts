import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../../client/api-client.js";
import { registerResourceWithTool } from "../resource-tool-factory.js";
import { PRIORITY_MAP, stripHtml, buildTaskUrl } from "./task-dto.js";

const STATUS_TO_COLUMN: Record<number, string> = {
  1: "New",
  2: "Develop",
  3: "Develop",
  4: "Code Review",
  5: "Code Review",
  6: "QA",
  7: "QA",
  8: "Done",
};

const EXCLUDED_STATUSES = new Set([9, 10]);

interface ListTask {
  id: number;
  name: string;
  description?: string;
  prioritiesId?: number;
  statusId?: number;
  projectId?: number;
  project?: { name?: string };
  author?: { fullNameRu?: string };
  createdAt?: string;
}

interface TaskOutput {
  id: number;
  name: string;
  description: string;
  project: string;
  priority: string;
  author: string;
  url: string;
  createdAt: string;
}

export async function fetchMyTasks(
  client: ApiClient,
): Promise<Record<string, TaskOutput[]>> {
  const TASK_FIELDS =
    "id,name,statusId,prioritiesId,description,projectId,prefix,factExecutionTime,plannedExecutionTime,sprintId,typeId,createdAt";
  const tasksResponse = (await client.get(
    `/api/v1/task?isOnlyMine=true&fields=${TASK_FIELDS}`,
  )) as { data?: ListTask[] };
  const tasks: ListTask[] = tasksResponse?.data ?? [];

  const columns: Record<string, TaskOutput[]> = {
    New: [],
    Develop: [],
    "Code Review": [],
    QA: [],
    Done: [],
  };

  for (const task of tasks) {
    if (
      task.statusId === undefined ||
      EXCLUDED_STATUSES.has(task.statusId)
    ) {
      continue;
    }

    const column = STATUS_TO_COLUMN[task.statusId];
    if (!column) continue;

    columns[column].push({
      id: task.id,
      name: task.name,
      description: task.description ? stripHtml(task.description) : "",
      project: task.project?.name ?? "",
      priority: PRIORITY_MAP[task.prioritiesId ?? 0] ?? "unknown",
      author: task.author?.fullNameRu ?? "",
      url: task.projectId ? buildTaskUrl(task.projectId, task.id) : "",
      createdAt: task.createdAt ?? "",
    });
  }

  return columns;
}

export function registerMyTasksResource(
  server: McpServer,
  client: ApiClient,
): void {
  registerResourceWithTool(server, client, {
    name: "my-tasks",
    uri: "tracker://tasks/my",
    fetcher: fetchMyTasks,
  });
}
