import { Link } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import { Icons } from "../ui/icons";

function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="home-topbar">
      <div className="home-topbar-inner">
        <div className="ui-brand">
          <div className="ui-brand-mark">{Icons.Book()}</div>
          <div>
            <h1>AI Subjective Exam Evaluator</h1>
            <p>Teacher and student sign-in</p>
          </div>
        </div>
        <div className="home-topbar-actions">
          <button
            type="button"
            className="ui-icon-btn"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            onClick={toggleTheme}
          >
            {theme === "dark" ? Icons.Sun() : Icons.Moon()}
          </button>
          <Link to="/login?role=teacher" className="ui-btn ui-btn-primary">
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
