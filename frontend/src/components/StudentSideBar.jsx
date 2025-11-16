import React, { useState } from 'react';


function StudentSideBar({ ButtonClicked, onClose }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // default active tab

  const handleClick = (tabName) => {
    setActiveTab(tabName);
    ButtonClicked(tabName);
   
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <aside className="student-sidebar" id="sidebar">
        <nav className="student-sidebar-nav">

          <div
            className={`student-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            data-tab="dashboard"
            onClick={() => handleClick('Dashboard')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Dashboard</span>
          </div>

          <div
            className={`student-nav-item ${activeTab === 'assignments' ? 'active' : ''}`}
            data-tab="assignments"
            onClick={() => handleClick('Assignments')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Assignments</span>
          </div>

          <div
            className={`student-nav-item ${activeTab === 'submissions' ? 'active' : ''}`}
            data-tab="submissions"
            onClick={() => handleClick('Submission')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>My Submissions</span>
          </div>

          <div
            className={`student-nav-item ${activeTab === 'progress' ? 'active' : ''}`}
            data-tab="progress"
            onClick={() => handleClick('Progress')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Progress</span>
          </div>

        </nav>
      </aside>
    </>
  );
}

export default StudentSideBar;