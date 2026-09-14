import { render, screen } from "@testing-library/react";
import CalibrationPanel from "./CalibrationPanel";

test("keeps sample name and expected score as separate labeled fields", () => {
  render(
    <CalibrationPanel
      questionText="Explain Newton’s laws"
      modelAnswer="First, second, and third laws"
      rubric={[]}
      maxMarks={10}
    />
  );

  const nameField = screen.getByLabelText("Sample name", { selector: "#sample-label-0" });
  const scoreField = screen.getByLabelText("Expected score", { selector: "#sample-score-0" });

  expect(nameField).toHaveValue("Sample 1");
  expect(scoreField).toHaveValue(null);
  expect(scoreField).toHaveAttribute("placeholder", "0–10");
  expect(nameField.compareDocumentPosition(scoreField) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
