import React from "react";

const NAV_ITEMS = [
  { id: "Dashboard", activeKey: "dashboard", label: "Dashboard" },
  { id: "Assignments", activeKey: "assignments", label: "Assignments" },
  { id: "Submission", activeKey: "submissions", label: "My Submissions" },
  { id: "Progress", activeKey: "progress", label: "Progress" }
];

function StudentSideBar({ ButtonClicked, onClose, activeTab, isOpen }) {
  const handleClick = (tabName) => {
    ButtonClicked(tabName);
    if (onClose) onClose();
  };

  return (
    <aside className={`student-sidebar ${isOpen ? "open" : ""}`} id="sidebar">
      <nav className="student-sidebar-nav" aria-label="Student dashboard">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`student-nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => handleClick(item.id)}
          >
            {item.activeKey === "dashboard" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            )}
            {item.activeKey === "assignments" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            )}
            {item.activeKey === "submissions" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            )}
            {item.activeKey === "progress" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            )}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default StudentSideBar;
