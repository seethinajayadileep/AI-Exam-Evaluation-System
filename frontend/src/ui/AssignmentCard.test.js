import { render, screen } from "@testing-library/react";
import AssignmentCard from "./AssignmentCard";
import { assignmentCardStatus } from "../utils/dates";

test("shows Graded instead of Open when every submission is already graded", () => {
  const status = assignmentCardStatus({ dueDate: "2099-01-01", submissions: 1, graded: 1 });
  render(
    <AssignmentCard
      title="Newton’s laws of motion"
      subject="science"
      dueDate="2099-01-01"
      status={status}
      submissions={1}
      graded={1}
    />
  );

  expect(screen.getByText("Graded")).toBeInTheDocument();
  expect(screen.queryByText("Open")).not.toBeInTheDocument();
});
