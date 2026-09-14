import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";
import { Icons } from "./icons";
import { useEscape } from "./useEscape";

const READ_NOTIFICATIONS_KEY = "examEvalReadNotifications";

function loadReadNotifications() {
  try {
    const raw = sessionStorage.getItem(READ_NOTIFICATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function persistReadNotifications(ids) {
  try {
    sessionStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify([...ids]));
  } catch {
    // Ignore quota or private-mode failures.
  }
}

function AppShell({
  role,
  title,
  navItems,
  activeTab,
  onNavigate,
  searchItems = [],
  notifications = [],
  dirtyGuard,
  children
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => (
    typeof window === "undefined" ? true : window.innerWidth > 1024
  ));
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(() => (
    typeof window === "undefined" ? false : window.innerWidth <= 1024
  ));
  const [readNotificationIds, setReadNotificationIds] = useState(loadReadNotifications);

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth <= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMenus = useCallback(() => {
    setSearchOpen(false);
    setNotifyOpen(false);
    setProfileOpen(false);
    setHelpOpen(false);
    setSettingsOpen(false);
  }, []);

  const shellChromeOpen = searchOpen || notifyOpen || profileOpen || helpOpen || settingsOpen;
  useEscape(shellChromeOpen, closeMenus);
  useEscape(isCompact && sidebarOpen && !helpOpen && !settingsOpen, () => {
    if (document.querySelector('[aria-modal="true"]')) return;
    setSidebarOpen(false);
  });

  const filteredSearch = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return searchItems.filter((item) => (
      item.label.toLowerCase().includes(term) ||
      item.group.toLowerCase().includes(term)
    )).slice(0, 8);
  }, [query, searchItems]);

  const requestNavigate = (tab, meta) => {
    if (dirtyGuard && !dirtyGuard()) return;
    onNavigate(tab, meta);
    if (isCompact) {
      setSidebarOpen(false);
    }
  };

  const unreadNotifications = useMemo(() => {
    const read = readNotificationIds;
    return notifications.filter((item) => !read.has(String(item.id)));
  }, [notifications, readNotificationIds]);

  const markNotificationRead = (id) => {
    setReadNotificationIds((current) => {
      const next = new Set(current);
      next.add(String(id));
      persistReadNotifications(next);
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="ui-shell">
      <header className="ui-topbar">
        <button
          type="button"
          className="ui-icon-btn"
          aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          {Icons.Menu()}
        </button>
        <div className="ui-brand">
          <div className="ui-brand-mark">{Icons.Book()}</div>
          <div>
            <h1>AI Subjective Exam Evaluator</h1>
            <p>{title}</p>
          </div>
        </div>
        <div className="ui-search">
          <span className="ui-search-icon">{Icons.Search()}</span>
          <label htmlFor="global-search" className="sr-only">Search assignments, students, and subjects</label>
          <input
            id="global-search"
            type="search"
            placeholder="Search assignments, students, subjects"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
          />
          {searchOpen && query.trim() && (
            <div className="ui-search-results" role="listbox" aria-label="Search results">
              {filteredSearch.length === 0 ? (
                <p className="ui-live" style={{ padding: 12 }}>No matches.</p>
              ) : (
                filteredSearch.map((item, index) => (
                  <button
                    key={`${item.group}-${item.label}-${item.assignmentId || item.submissionId || item.id || index}`}
                    type="button"
                    role="option"
                    aria-selected="false"
                    onClick={() => {
                      requestNavigate(item.tab, item);
                      setQuery("");
                      setSearchOpen(false);
                    }}
                  >
                    <strong>{item.label}</strong>
                    <span className="ui-live"> · {item.group}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <div className="ui-topbar-actions">
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="ui-icon-btn"
              aria-label={`Notifications${unreadNotifications.length ? `, ${unreadNotifications.length} unread` : ""}`}
              aria-expanded={notifyOpen}
              onClick={() => {
                setNotifyOpen((open) => !open);
                setProfileOpen(false);
              }}
            >
              {Icons.Bell()}
            </button>
            {notifyOpen && (
              <div className="ui-menu" role="menu" aria-label="Notifications">
                {notifications.length === 0 ? (
                  <p className="ui-live" style={{ padding: 8 }}>No new notifications.</p>
                ) : (
                  notifications.map((item) => {
                    const unread = unreadNotifications.some((note) => String(note.id) === String(item.id));
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          markNotificationRead(item.id);
                          setNotifyOpen(false);
                          if (item.tab) requestNavigate(item.tab, item);
                        }}
                      >
                        {item.label}
                        {unread ? <span className="ui-live"> · Unread</span> : null}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="ui-icon-btn"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              onClick={() => {
                setProfileOpen((open) => !open);
                setNotifyOpen(false);
              }}
            >
              {(user?.name || role).slice(0, 1).toUpperCase()}
            </button>
            {profileOpen && (
              <div className="ui-menu" role="menu" aria-label="Profile menu">
                <p style={{ padding: "8px 12px" }}>
                  <strong>{user?.name || "User"}</strong>
                  <br />
                  <span className="ui-live">{role}</span>
                </p>
                <button type="button" role="menuitem" onClick={toggleTheme}>
                  {theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                </button>
                <button type="button" role="menuitem" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="ui-body">
        {sidebarOpen && isCompact && (
          <button
            type="button"
            className="ui-backdrop sidebar-backdrop"
            aria-label="Dismiss navigation overlay"
            tabIndex={-1}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          id="app-sidebar"
          className={`ui-sidebar ${sidebarOpen ? "is-open" : ""} ${!sidebarOpen ? "is-collapsed" : ""}`}
        >
          <nav className="ui-sidebar-nav" aria-label={`${title} navigation`}>
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`ui-nav-item ${activeTab === item.id ? "is-active" : ""}`}
                onClick={() => requestNavigate(item.id)}
                aria-current={activeTab === item.id ? "page" : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="ui-sidebar-foot">
            <button type="button" className="ui-nav-item" onClick={() => setSettingsOpen(true)}>
              {Icons.Settings()}
              <span>Settings</span>
            </button>
            <button type="button" className="ui-nav-item" onClick={() => setHelpOpen(true)}>
              {Icons.Help()}
              <span>Help</span>
            </button>
          </div>
        </aside>
        <main className={`ui-main ${sidebarOpen ? "" : "is-collapsed"}`}>
          {children}
        </main>
      </div>

      {settingsOpen && (
        <div className="ui-dialog-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="ui-dialog" role="dialog" aria-labelledby="settings-title" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="ui-dialog-header">
              <h2 id="settings-title">Settings</h2>
              <button type="button" className="ui-icon-btn" aria-label="Close settings" onClick={() => setSettingsOpen(false)}>
                {Icons.Close()}
              </button>
            </div>
            <p>Appearance and session stay on this device. Authentication and grading still use the existing server APIs.</p>
            <div className="ui-dialog-actions">
              <button type="button" className="ui-btn ui-btn-secondary" onClick={toggleTheme}>
                {theme === "dark" ? Icons.Sun() : Icons.Moon()}
                {theme === "dark" ? "Use light theme" : "Use dark theme"}
              </button>
            </div>
          </div>
        </div>
      )}

      {helpOpen && (
        <div className="ui-dialog-overlay" onClick={() => setHelpOpen(false)}>
          <div className="ui-dialog" role="dialog" aria-labelledby="help-title" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="ui-dialog-header">
              <h2 id="help-title">Help</h2>
              <button type="button" className="ui-icon-btn" aria-label="Close help" onClick={() => setHelpOpen(false)}>
                {Icons.Close()}
              </button>
            </div>
            <ul>
              <li>Use the sidebar to move between dashboard views. The current page is highlighted.</li>
              <li>Search looks through assignments, students, and subjects already loaded in this session.</li>
              <li>Press Escape to close menus, overlays, and dialogs.</li>
              <li>Students keep autosaved drafts. Teachers approve or override AI grades without changing stored model answers.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppShell;
