import React, { useState } from 'react';

function TeacherSideBar({ ButtonClicked }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleClick = (tabName) => {
    setActiveTab(tabName);
    ButtonClicked(tabName);
  };

  return (
    <aside className="teacher-ai-sidebar" id="sidebar">
      <nav className="teacher-ai-sidebar-nav">

        <div
          className={`teacher-ai-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          data-tab="dashboard"
          onClick={() => handleClick('dashboard')}
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
          className={`teacher-ai-nav-item ${activeTab === 'upload' ? 'active' : ''}`}
          data-tab="upload"
          onClick={() => handleClick('upload')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <span>Upload Question</span>
        </div>

        <div
          className={`teacher-ai-nav-item ${activeTab === 'submission' ? 'active' : ''}`}
          data-tab="submissions"
          onClick={() => handleClick('submission')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
          </svg>
          <span>View Submissions</span>
        </div>

      </nav>
    </aside>
  );
}

export default TeacherSideBar;
