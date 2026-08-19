export class ApiClient {
  private baseUrl: string;
  private cookie: string;

  constructor(baseUrl: string, cookie: string) {
    this.baseUrl = baseUrl;
    this.cookie = cookie;
  }

  get isAuthenticated(): boolean {
    return this.cookie !== "";
  }

  async login(login: string, password: string): Promise<void> {
    if (!this.baseUrl) {
      throw new Error(
        "TRACKER_BASE_URL is not set. Configure the environment variable to use tracker tools.",
      );
    }

    const url = `${this.baseUrl}/api/v1/auth/login`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Login failed: HTTP ${response.status} ${response.statusText}${text ? `: ${text}` : ""}`,
      );
    }

    const setCookies = response.headers.getSetCookie();
    const authCookie = setCookies.find((c) => c.startsWith("authorization="));
    if (!authCookie) {
      throw new Error("Login response did not contain an authorization cookie.");
    }

    this.cookie = authCookie.split(";")[0];
  }

  private async request(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<unknown> {
    if (!this.baseUrl) {
      throw new Error(
        "TRACKER_BASE_URL is not set. Configure the environment variable to use tracker tools.",
      );
    }
    if (!this.cookie) {
      throw new Error(
        "Not authenticated. Call refresh_session or set TRACKER_COOKIE.",
      );
    }

    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Cookie: this.cookie,
    };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `HTTP ${response.status} ${response.statusText} — ${method} ${path}${text ? `: ${text}` : ""}`,
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  }

  get(path: string): Promise<unknown> {
    return this.request("GET", path);
  }

  post(path: string, body?: unknown): Promise<unknown> {
    return this.request("POST", path, body);
  }

  patch(path: string, body?: unknown): Promise<unknown> {
    return this.request("PATCH", path, body);
  }
}
