export interface RawTask {
  id: number;
  name: string;
  description?: string;
  statusId?: number;
  prioritiesId?: number;
  typeId?: number;
  projectId?: number;
  project?: { name?: string };
  author?: { fullNameRu?: string };
  performer?: { fullNameRu?: string } | null;
  parentId?: number | null;
  createdAt?: string;
}

export interface TaskOutput {
  id: number;
  name: string;
  type: string;
  status: string;
  description: string;
  priority: string;
  performer: string;
  author: string;
  project: string;
  parentId: number | null;
  url: string;
  createdAt: string;
}

export const STATUS_MAP: Record<number, string> = {
  1: "New",
  2: "Develop",
  3: "Develop",
  4: "Code Review",
  5: "Code Review",
  6: "QA",
  7: "QA",
  8: "Done",
  9: "Canceled",
  10: "Closed",
};

export const PRIORITY_MAP: Record<number, string> = {
  1: "critical",
  2: "high",
  3: "medium",
  4: "low",
  5: "lowest",
};

export const TYPE_MAP: Record<number, string> = {
  1: "task",
  2: "bug",
};

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

export function buildTaskUrl(projectId: number, taskId: number): string {
  return `http://track.nordclan/projects/${projectId}/tasks/${taskId}`;
}

export function toTaskOutput(raw: RawTask): TaskOutput {
  return {
    id: raw.id,
    name: raw.name,
    type: TYPE_MAP[raw.typeId ?? 0] ?? "unknown",
    status: STATUS_MAP[raw.statusId ?? 0] ?? "unknown",
    description: raw.description ? stripHtml(raw.description) : "",
    priority: PRIORITY_MAP[raw.prioritiesId ?? 0] ?? "unknown",
    performer: raw.performer?.fullNameRu ?? "",
    author: raw.author?.fullNameRu ?? "",
    project: raw.project?.name ?? "",
    parentId: raw.parentId ?? null,
    url: raw.projectId ? buildTaskUrl(raw.projectId, raw.id) : "",
    createdAt: raw.createdAt ?? "",
  };
}
