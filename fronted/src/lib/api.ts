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

  if (
    !headers.has("Content-Type") &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers,
      },
    );
  } catch {
    throw new Error(
      "Unable to connect to FleetFlow. Please make sure the server is running and try again.",
    );
  }

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("fleetflow_token");
      localStorage.removeItem("fleetflow_user");

      document.cookie =
        "fleetflow_token=; path=/; max-age=0; SameSite=Lax";

      window.location.href = "/login";
    }

    throw new Error(
      "Your FleetFlow session has expired. Please sign in again.",
    );
  }

  if (response.status === 403) {
    throw new Error(
      "You do not have permission to perform this action.",
    );
  }

  if (response.status === 404) {
    throw new Error(
      "The requested FleetFlow resource was not found.",
    );
  }

  if (response.status >= 500) {
    throw new Error(
      "FleetFlow encountered a server error. Please try again later.",
    );
  }

  if (!response.ok) {
    let message =
      "Something went wrong while processing your request.";

    try {
      const data = await response.json();

      if (Array.isArray(data.message)) {
        message = data.message.join(", ");
      } else if (
        typeof data.message === "string" &&
        data.message.trim()
      ) {
        message = data.message;
      } else if (
        typeof data.error === "string" &&
        data.error.trim()
      ) {
        message = data.error;
      }
    } catch {
      // Keep the default message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType =
    response.headers.get("content-type");

  if (
    !contentType?.includes("application/json")
  ) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    throw new Error(
      "FleetFlow returned an invalid response.",
    );
  }
}
