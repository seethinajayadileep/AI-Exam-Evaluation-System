import { assignmentHasDraft, draftExists, readLocalDraft, writeLocalDraft, clearLocalDraft } from "./drafts";

beforeEach(() => {
  localStorage.clear();
});

test("detects a saved draft answer", () => {
  expect(draftExists("user-1", "assign-1")).toBe(false);
  writeLocalDraft("user-1", "assign-1", "A partial answer");
  expect(draftExists("user-1", "assign-1")).toBe(true);
  expect(readLocalDraft("user-1", "assign-1").answer).toBe("A partial answer");
  clearLocalDraft("user-1", "assign-1");
  expect(draftExists("user-1", "assign-1")).toBe(false);
});

test("uses the server hasDraft flag when local storage is empty", () => {
  const assignment = { _id: "assign-1", status: "pending", hasDraft: true };
  expect(assignmentHasDraft(assignment, "user-1")).toBe(true);
  expect(assignmentHasDraft({ ...assignment, hasDraft: false }, "user-1")).toBe(false);
  writeLocalDraft("user-1", "assign-1", "Saved locally");
  expect(assignmentHasDraft({ ...assignment, hasDraft: false }, "user-1")).toBe(true);
});
