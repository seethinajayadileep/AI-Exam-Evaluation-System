import React, { useState } from "react";
import "./StudentDashBoard.css";
import StudentHome from "../components/StudentHome";
import StudentAvailableAssignments from "../components/StudentAvailableAssignments";
import StudentSubmission from "../components/StudentSubmission";
import StudentProgress from "../components/StudentProgress";
import AppShell from "../ui/AppShell";
import { Icons } from "../ui/icons";

const NAV_ITEMS = [
  { id: "Dashboard", label: "Dashboard", icon: Icons.Dashboard() },
  { id: "Assignments", label: "Assignments", icon: Icons.Calendar() },
  { id: "Submission", label: "My Submissions", icon: Icons.Document() },
  { id: "Progress", label: "Progress", icon: Icons.Chart() }
];

function StudentDashBoard() {
  const [display, setDisplay] = useState("Dashboard");
  const [searchItems, setSearchItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [focus, setFocus] = useState(null);

  const requestNavigate = (tab, meta) => {
    setDisplay(tab);
    setFocus(meta ? { ...meta, at: Date.now() } : null);
  };

  let displayContent;
  if (display === "Dashboard") {
    displayContent = (
      <StudentHome
        onViewAssignments={(assignmentId) => {
          requestNavigate("Assignments", assignmentId ? { assignmentId } : null);
        }}
        onViewSubmissions={() => requestNavigate("Submission")}
        onIndexChange={({ searchItems: items, notifications: notes }) => {
          setSearchItems(items);
          setNotifications(notes);
        }}
      />
    );
  } else if (display === "Assignments") {
    displayContent = <StudentAvailableAssignments focus={focus} />;
  } else if (display === "Submission") {
    displayContent = <StudentSubmission />;
  } else {
    displayContent = <StudentProgress />;
  }

  return (
    <AppShell
      role="student"
      title="Student Dashboard"
      navItems={NAV_ITEMS}
      activeTab={display}
      onNavigate={requestNavigate}
      searchItems={searchItems}
      notifications={notifications}
    >
      {displayContent}
    </AppShell>
  );
}

export default StudentDashBoard;
