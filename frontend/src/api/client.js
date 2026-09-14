const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5038";
export const AUTH_LOST_EVENT = "examEvalAuthLost";

export function getStoredToken() {
  return localStorage.getItem("examEvalToken");
}

export async function api(path, options = {}) {
  const { skipAuth = false, headers: extraHeaders, ...fetchOptions } = options;
  const token = skipAuth ? null : getStoredToken();
  const headers = {
    ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
    ...(extraHeaders || {})
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (response.status === 401 && path !== "/api/auth/login") {
    const currentToken = getStoredToken();
    if (token && currentToken && token === currentToken) {
      localStorage.removeItem("examEvalToken");
      localStorage.removeItem("examEvalUser");
      window.dispatchEvent(new Event(AUTH_LOST_EVENT));
      if (!window.location.pathname.startsWith("/login") && window.location.pathname !== "/") {
        window.location.assign("/login");
      }
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data;
}
