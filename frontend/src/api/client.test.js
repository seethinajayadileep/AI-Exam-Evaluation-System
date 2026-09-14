import { api } from "./client";

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("a stale 401 does not wipe a newer login token", async () => {
  localStorage.setItem("examEvalToken", "old-student-token");
  fetch.mockImplementation(async () => {
    localStorage.setItem("examEvalToken", "new-teacher-token");
    return {
      status: 401,
      ok: false,
      text: async () => JSON.stringify({ message: "Invalid or expired session." })
    };
  });

  await expect(api("/api/auth/me")).rejects.toThrow(/Invalid or expired session/i);
  expect(localStorage.getItem("examEvalToken")).toBe("new-teacher-token");
});
