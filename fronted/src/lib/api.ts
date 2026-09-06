const API_URL = "http://localhost:3001";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("fleetflow_token")
      : null;

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("fleetflow_token");
      localStorage.removeItem("fleetflow_user");

      document.cookie =
        "fleetflow_token=; path=/; max-age=0; SameSite=Lax";

      window.location.href = "/login";
    }

    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const data = await response.json();

      if (Array.isArray(data.message)) {
        message = data.message.join(", ");
      } else if (data.message) {
        message = data.message;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
