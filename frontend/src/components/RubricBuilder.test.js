import { rubricIsBalanced, rubricTotal } from "./RubricBuilder";

test("rubric totals must equal maximum marks", () => {
  const rubric = [
    { criterion: "Method", maxMarks: 6 },
    { criterion: "Accuracy", maxMarks: 4 }
  ];
  expect(rubricTotal(rubric)).toBe(10);
  expect(rubricIsBalanced(rubric, 10)).toBe(true);
  expect(rubricIsBalanced(rubric, 12)).toBe(false);
});
