import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormStepper from "./FormStepper";

test("marks the current step and allows navigating completed steps", async () => {
  const onSelect = jest.fn();
  render(
    <FormStepper
      current={1}
      onSelect={onSelect}
      steps={[
        { id: "a", label: "Question details" },
        { id: "b", label: "Model answer" },
        { id: "c", label: "Rubric" }
      ]}
    />
  );

  expect(screen.getByRole("button", { name: /2. Model answer/i })).toHaveAttribute("aria-current", "step");
  await userEvent.click(screen.getByRole("button", { name: /1. Question details/i }));
  expect(onSelect).toHaveBeenCalledWith(0);
});
