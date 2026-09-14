import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmptyState from "./EmptyState";

test("renders empty and error copy with a retry action", async () => {
  const onRetry = jest.fn();
  render(
    <EmptyState
      title="Could not load the dashboard"
      description="Network error"
      action={<button type="button" onClick={onRetry}>Retry</button>}
    />
  );
  expect(screen.getByText("Could not load the dashboard")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(onRetry).toHaveBeenCalled();
});
