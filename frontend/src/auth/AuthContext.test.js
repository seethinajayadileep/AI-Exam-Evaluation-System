import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import { api } from "../api/client";

jest.mock("../api/client", () => ({
  api: jest.fn(),
  AUTH_LOST_EVENT: "examEvalAuthLost"
}));

function Probe() {
  const { user, login } = useAuth();
  return (
    <div>
      <p>role:{user?.role || "none"}</p>
      <button type="button" onClick={() => login("teacher@demo.school", "pw", "teacher")}>
        login teacher
      </button>
    </div>
  );
}

afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

test("ignores a stale session restore after a newer login", async () => {
  let resolveMe;
  api.mockImplementation((path) => {
    if (path === "/api/auth/me") {
      return new Promise((resolve) => {
        resolveMe = resolve;
      });
    }
    if (path === "/api/auth/login") {
      return Promise.resolve({
        token: "teacher-token",
        user: { id: "2", role: "teacher", name: "Maya" }
      });
    }
    return Promise.reject(new Error(`unexpected ${path}`));
  });

  localStorage.setItem("examEvalToken", "student-token");
  localStorage.setItem("examEvalUser", JSON.stringify({ id: "1", role: "student", name: "Alex" }));

  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );

  fireEvent.click(screen.getByRole("button", { name: "login teacher" }));
  await waitFor(() => expect(screen.getByText("role:teacher")).toBeInTheDocument());

  resolveMe({ user: { id: "1", role: "student", name: "Alex" } });
  await waitFor(() => expect(screen.getByText("role:teacher")).toBeInTheDocument());
  expect(screen.queryByText("role:student")).not.toBeInTheDocument();
});
