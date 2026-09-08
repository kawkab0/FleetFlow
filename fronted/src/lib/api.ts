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

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    throw new Error(
      "Your FleetFlow session is no longer valid. Please sign in again.",
    );
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
      // Keep default message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
