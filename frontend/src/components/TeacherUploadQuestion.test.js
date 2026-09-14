import { fireEvent, render, screen } from "@testing-library/react";
import TeacherUploadQuestion from "./TeacherUploadQuestion";
import { ToastProvider } from "../ui/ToastContext";
import { api } from "../api/client";

jest.mock("../api/client", () => ({
  api: jest.fn()
}));

function renderForm() {
  return render(
    <ToastProvider>
      <TeacherUploadQuestion />
    </ToastProvider>
  );
}

test("keeps Continue and Publish as separate actions", () => {
  renderForm();
  expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Publish assignment" })).not.toBeInTheDocument();
});

test("submitting the form does not publish an assignment", () => {
  renderForm();
  fireEvent.submit(screen.getByRole("button", { name: "Continue" }).closest("form"));
  expect(api).not.toHaveBeenCalled();
});
