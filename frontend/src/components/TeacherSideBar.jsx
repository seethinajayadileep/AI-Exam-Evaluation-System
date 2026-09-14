import React from "react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "upload", label: "Upload Question" },
  { id: "submission", label: "View Submissions" }
];

function TeacherSideBar({ ButtonClicked, activeTab, isOpen }) {
  return (
    <aside className={`teacher-ai-sidebar ${isOpen ? "open" : "collapsed"}`} id="sidebar">
      <nav className="teacher-ai-sidebar-nav" aria-label="Teacher dashboard">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`teacher-ai-nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => ButtonClicked(item.id)}
          >
            {item.id === "dashboard" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            )}
            {item.id === "upload" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            )}
            {item.id === "submission" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            )}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default TeacherSideBar;
