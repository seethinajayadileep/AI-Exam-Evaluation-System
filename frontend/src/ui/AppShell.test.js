import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppShell from "./AppShell";
import { AuthProvider } from "../auth/AuthContext";
import { ThemeProvider } from "../theme/ThemeContext";
import { Icons } from "./icons";

function renderShell({
  sidebarForceOpen,
  onNavigate = () => {},
  searchItems = [],
  notifications = []
} = {}) {
  if (sidebarForceOpen) {
    window.innerWidth = 500;
  }
  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter>
          <AppShell
            role="teacher"
            title="Teacher Dashboard"
            activeTab="dashboard"
            onNavigate={onNavigate}
            searchItems={searchItems}
            notifications={notifications}
            navItems={[{ id: "dashboard", label: "Dashboard", icon: Icons.Dashboard() }]}
          >
            <p>Content</p>
          </AppShell>
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

beforeEach(() => {
  sessionStorage.clear();
  window.innerWidth = 1440;
});

test("highlights the active navigation item", () => {
  renderShell();
  expect(screen.getByRole("button", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
});

test("names the mobile overlay distinctly from the menu toggle", () => {
  window.innerWidth = 500;
  render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter>
          <AppShell
            role="student"
            title="Student Dashboard"
            activeTab="Dashboard"
            onNavigate={() => {}}
            navItems={[{ id: "Dashboard", label: "Dashboard", icon: Icons.Dashboard() }]}
          >
            <p>Content</p>
          </AppShell>
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );

  const toggle = screen.getByRole("button", { name: "Open navigation menu" });
  fireEvent.click(toggle);
  const overlay = screen.getByLabelText("Dismiss navigation overlay");
  expect(overlay).toHaveAttribute("tabindex", "-1");
  expect(screen.queryAllByRole("button", { name: "Close navigation menu" })).toHaveLength(1);
});

test("search result click navigates with the selected assignment", () => {
  const onNavigate = jest.fn();
  renderShell({
    onNavigate,
    searchItems: [{
      label: "Quadratic Equations",
      group: "Assignment",
      tab: "dashboard",
      assignmentId: "assign-1"
    }]
  });

  fireEvent.change(screen.getByLabelText(/Search assignments/i), { target: { value: "quadratic" } });
  fireEvent.click(screen.getByRole("option", { name: /Quadratic Equations/i }));

  expect(onNavigate).toHaveBeenCalledWith("dashboard", expect.objectContaining({
    label: "Quadratic Equations",
    assignmentId: "assign-1"
  }));
});

test("opening a notification marks it as read", () => {
  const onNavigate = jest.fn();
  renderShell({
    onNavigate,
    notifications: [{
      id: "sub-1",
      label: "Alex Johnson needs review: Electric Circuits Basics",
      tab: "submission",
      submissionId: "sub-1"
    }]
  });

  fireEvent.click(screen.getByRole("button", { name: "Notifications, 1 unread" }));
  fireEvent.click(screen.getByRole("menuitem", { name: /Alex Johnson needs review/i }));

  expect(onNavigate).toHaveBeenCalledWith("submission", expect.objectContaining({
    id: "sub-1",
    submissionId: "sub-1"
  }));
  expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /1 unread/ })).not.toBeInTheDocument();
});
