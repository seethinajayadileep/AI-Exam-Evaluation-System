import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function StudentHeader({ onButtonClick, sidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="student-header">
      <div className="student-header-content">
        <div className="student-header-left">
          <button
            type="button"
            className="student-sidebar-toggle"
            aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={sidebarOpen}
            onClick={onButtonClick}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="student-logo">
            <svg className="student-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H18a2 2 0 0 1 2 2v18l-4-3-4 3-4-3-4 3z" />
              <path d="M9 9h6M9 13h6" />
            </svg>
          </div>
          <div className="student-header-title">
            <h1>AI Subjective Exam Evaluator</h1>
            <p className="student-header-subtitle">Student Dashboard</p>
          </div>
        </div>
        <div className="student-header-right">
          <div className="student-user-info">
            <p className="student-user-name">Welcome, {user?.name || "Student"}</p>
            <p className="student-user-role">Student</p>
          </div>
          <button type="button" className="student-logout-btn" onClick={handleLogout} aria-label="Log out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default StudentHeader;
