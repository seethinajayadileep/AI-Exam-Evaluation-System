import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDialog from "./ConfirmDialog";

test("exposes an accessible confirmation dialog and closes on Escape", async () => {
  const onCancel = jest.fn();
  render(
    <ConfirmDialog
      open
      title="Delete assignment?"
      description="This cannot be undone."
      confirmLabel="Delete"
      onCancel={onCancel}
      onConfirm={() => {}}
    />
  );

  expect(screen.getByRole("alertdialog", { name: "Delete assignment?" })).toBeInTheDocument();
  expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  await userEvent.keyboard("{Escape}");
  expect(onCancel).toHaveBeenCalled();
});
