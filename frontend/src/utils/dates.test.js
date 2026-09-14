import { assignmentCardStatus, isDueDateValid, reviewScoreLabel, todayInputDate } from "./dates";

test("rejects due dates earlier than today", () => {
  expect(isDueDateValid("2020-01-01", "2026-09-08")).toBe(false);
  expect(isDueDateValid("2026-09-08", "2026-09-08")).toBe(true);
  expect(isDueDateValid("2026-09-09", "2026-09-08")).toBe(true);
  expect(isDueDateValid("", todayInputDate())).toBe(false);
});

test("assignment cards use grading progress instead of a blanket Open label", () => {
  expect(assignmentCardStatus({ dueDate: "2099-01-01", submissions: 0, graded: 0 })).toBe("open");
  expect(assignmentCardStatus({ dueDate: "2099-01-01", submissions: 1, graded: 1 })).toBe("graded");
  expect(assignmentCardStatus({ dueDate: "2099-01-01", submissions: 2, graded: 1 })).toBe("pending_review");
  expect(assignmentCardStatus({ dueDate: "2020-01-01", submissions: 0, graded: 0 })).toBe("expired");
});

test("labels pending AI scores as suggestions instead of final grades", () => {
  expect(reviewScoreLabel({ status: "graded", score: 10, maxMarks: 10 })).toBe("10/10");
  expect(reviewScoreLabel({ status: "pending_review", score: 10, maxMarks: 10 })).toBe("AI suggested: 10/10");
  expect(reviewScoreLabel({ status: "pending_review", score: null, maxMarks: 10 })).toBe("Not graded");
  expect(reviewScoreLabel({ status: "submitted", score: 8, maxMarks: 10 })).toBe("Not graded");
});
