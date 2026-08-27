import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { IconMenu, IconMoon, IconSun } from "./ui";

export function AppShell({ title, subtitle, nav, children }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <NavLink to="/" className="brand">
          <span className="brand-mark">S</span>
          Subjective AI
        </NavLink>
        <nav className="side-nav">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`btn ${item.active ? "active" : ""}`}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button className="btn btn-ghost" type="button" onClick={toggle}>
            {theme === "dark" ? <IconSun /> : <IconMoon />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button
            className="btn btn-danger"
            type="button"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <div>
        <header className="topbar">
          <div className="inline">
            <button className="icon-btn mobile-toggle" type="button" onClick={() => setOpen((v) => !v)}>
              <IconMenu />
            </button>
            <div>
              <h2 style={{ fontSize: "1.15rem" }}>{title}</h2>
              <div className="muted">{subtitle}</div>
            </div>
          </div>
          <div className="user-chip">
            <div className="avatar">{(user?.name || "U").slice(0, 1)}</div>
            <div>
              <div>{user?.name}</div>
              <div className="muted">{user?.role}</div>
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
