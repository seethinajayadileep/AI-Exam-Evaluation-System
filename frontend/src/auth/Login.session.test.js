import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";
import { AuthContext } from "./AuthContext";

test("warns when a signed-in student opens teacher login", () => {
  render(
    <AuthContext.Provider
      value={{
        user: { id: "1", role: "student", name: "Alex Johnson" },
        ready: true,
        login: jest.fn(),
        logout: jest.fn()
      }}
    >
      <MemoryRouter initialEntries={["/login?role=teacher"]}>
        <Login />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  expect(screen.getByText(/signed in as Alex Johnson \(student\)/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Replace session and sign in" })).toBeInTheDocument();
});
