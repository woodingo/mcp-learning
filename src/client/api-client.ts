export class ApiClient {
  private baseUrl: string;
  private cookie: string;
  private credentials: { login: string; password: string } | null = null;

  constructor(baseUrl: string, cookie: string) {
    this.baseUrl = baseUrl;
    this.cookie = cookie;
  }

  get isAuthenticated(): boolean {
    return this.cookie !== "";
  }

  setCredentials(login: string, password: string): void {
    this.credentials = { login, password };
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

  private async ensureAuthenticated(): Promise<void> {
    if (this.cookie) {
      return;
    }
    if (this.credentials) {
      await this.login(this.credentials.login, this.credentials.password);
      return;
    }
    throw new Error(
      "Not authenticated. Call the tracker_refresh_session tool to log in.",
    );
  }

  private async rawFetch(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Cookie: this.cookie,
    };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    return fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
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

    await this.ensureAuthenticated();

    let response = await this.rawFetch(method, path, body);

    if (response.status === 401 && this.credentials) {
      this.cookie = "";
      await this.ensureAuthenticated();
      response = await this.rawFetch(method, path, body);
    }

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

  put(path: string, body?: unknown): Promise<unknown> {
    return this.request("PUT", path, body);
  }
}
