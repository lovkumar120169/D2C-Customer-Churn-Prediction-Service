// Base URL of the deployed (or local) FastAPI churn service.
// Set VITE_API_URL in a .env file to point this at your deployed backend,
// e.g. VITE_API_URL=https://d2c-churn-api.onrender.com
export const API_BASE_URL = "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (networkError) {
    throw new ApiError(
      "Could not reach the churn API. Is the backend running and is the URL correct?",
      0,
      networkError.message
    );
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const detail = body?.detail;
    const message = Array.isArray(detail)
      ? detail.map((d) => `${d.loc?.slice(-1)[0]}: ${d.msg}`).join(", ")
      : detail || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, detail);
  }

  return body;
}

export function checkHealth() {
  return request("/health");
}

export function predictChurn(payload) {
  return request("/predict", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function batchPredictChurn(customers) {
  return request("/batch_predict", {
    method: "POST",
    body: JSON.stringify({ customers }),
  });
}
