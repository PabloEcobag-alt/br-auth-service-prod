export interface ModulePermissionDto {
  moduleName: string;
  canRead: boolean;
  canWrite: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
}

export interface AppPermissionDto {
  appName: string;
  modules: ModulePermissionDto[];
}

export interface UserListItemDto {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
  isDeleted: boolean;
}

export interface UserDetailDto {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
  apps: AppPermissionDto[];
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  apps: AppPermissionDto[];
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  apps: AppPermissionDto[];
}

const API_BASE = (process.env.AUTH_ISSUER || "https://localhost:5001/").replace(/\/?$/, "/api/");

async function apiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;

  // --- DIAGNOSTICS ---
  if (!token || token.trim() === "") {
    console.error(`[apiClient] ⛔ No access token available for request: ${url}`);
  } else {
    console.log(`[apiClient] 🔑 Token present (first 20 chars): ${token.slice(0, 20)}...`);
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  console.log(`[apiClient] ➡️  ${options.method ?? "GET"} ${url}`);

  const res = await fetch(url, fetchOptions);

  console.log(`[apiClient] ⬅️  ${res.status} ${res.statusText} — ${url}`);

  if (!res.ok) {
    let message = `API request failed with status ${res.status}`;
    try {
      const errBody = await res.json();
      console.error(`[apiClient] ❌ Error body:`, JSON.stringify(errBody));
      if (errBody?.message) {
        message = errBody.message;
      } else if (typeof errBody === "string") {
        message = errBody;
      }
    } catch {
      const text = await res.text().catch(() => "");
      if (text) console.error(`[apiClient] ❌ Error text:`, text);
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return null as T;
  }

  return res.json() as Promise<T>;
}

export async function getUsers(token: string, includeDeleted = false): Promise<UserListItemDto[]> {
  return apiFetch<UserListItemDto[]>(`users?includeDeleted=${includeDeleted}`, token, {
    next: { revalidate: 0 },
  });
}

export async function getUser(token: string, id: string): Promise<UserDetailDto> {
  return apiFetch<UserDetailDto>(`users/${id}`, token, {
    next: { revalidate: 0 },
  });
}

export async function createUser(token: string, request: CreateUserRequest): Promise<UserDetailDto> {
  return apiFetch<UserDetailDto>("users", token, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateUser(
  token: string,
  id: string,
  request: UpdateUserRequest
): Promise<UserDetailDto> {
  return apiFetch<UserDetailDto>(`users/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export async function deleteUser(token: string, id: string): Promise<void> {
  return apiFetch<void>(`users/${id}`, token, {
    method: "DELETE",
  });
}

export async function getRoles(token: string): Promise<string[]> {
  return apiFetch<string[]>("roles", token, {
    next: { revalidate: 3600 }, // Cache roles for an hour
  });
}

export async function getApps(token: string): Promise<AppPermissionDto[]> {
  return apiFetch<AppPermissionDto[]>("apps", token, {
    next: { revalidate: 3600 }, // Cache apps list for an hour
  });
}

export async function checkEmailExists(
  token: string,
  email: string,
  excludeUserId?: string
): Promise<boolean> {
  const params = new URLSearchParams({ email });
  if (excludeUserId) {
    params.set("excludeUserId", excludeUserId);
  }
  const result = await apiFetch<{ exists: boolean }>(
    `users/check-email?${params.toString()}`,
    token
  );
  return result.exists;
}
