const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5038").replace(/\/$/, "");

function token() {
  return localStorage.getItem("evalia-token");
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const auth = token();
  if (auth) headers.Authorization = `Bearer ${auth}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }
  if (!response.ok) {
    throw new Error((data && data.message) || `Request failed (${response.status})`);
  }
  return data;
}

export const api = {
  health: () => request("/health"),
  demoAccounts: () => request("/auth/demo"),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  assignments: () => request("/assignments"),
  analytics: () => request("/analytics"),
  createAssignment: (payload) =>
    request("/assignments/add", { method: "POST", body: JSON.stringify(payload) }),
  updateAssignment: (id, payload) =>
    request(`/assignments/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteAssignment: (id) => request(`/assignments/${id}`, { method: "DELETE" }),
  submitAnswer: (id, submittedAnswer) =>
    request(`/assignments/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ submittedAnswer }),
    }),
  evaluate: (id) => request(`/assignments/${id}/evaluate`, { method: "POST" }),
  seed: () => request("/seed", { method: "POST" }),
};

export { API_BASE };
