import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the landing headline", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /Automated Grading with/i })).toBeInTheDocument();
  expect(screen.getByText("AI-Powered Feedback")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Switch to (light|dark) theme/i })).toBeInTheDocument();
});
