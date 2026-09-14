import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { AuthContext } from "./AuthContext";

function renderWithUser(user) {
  return render(
    <AuthContext.Provider value={{ user, ready: true, login: jest.fn(), logout: jest.fn() }}>
      <MemoryRouter initialEntries={["/TeacherDashBoard"]}>
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route
            path="/TeacherDashBoard"
            element={(
              <ProtectedRoute role="teacher">
                <p>Teacher secret</p>
              </ProtectedRoute>
            )}
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

test("redirects unauthenticated users away from protected routes", () => {
  renderWithUser(null);
  expect(screen.getByText("Login page")).toBeInTheDocument();
  expect(screen.queryByText("Teacher secret")).not.toBeInTheDocument();
});

test("renders the protected page for the matching role", () => {
  renderWithUser({ id: "1", role: "teacher", name: "Maya" });
  expect(screen.getByText("Teacher secret")).toBeInTheDocument();
});
