export function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
    </svg>
  );
}

export function IconMenu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function StatusBadge({ status }) {
  return <span className={`badge badge-${status || "pending"}`}>{status || "pending"}</span>;
}

export function StatCard({ label, value, hint }) {
  return (
    <div className="stat-card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {hint ? <div className="muted">{hint}</div> : null}
    </div>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p className="muted">{body}</p>
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }) {
  return <div className="skeleton" role="status" aria-label={label} />;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="error-box">
      <p>{message}</p>
      {onRetry ? (
        <button className="btn btn-ghost btn-sm" onClick={onRetry} type="button">
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function Modal({ title, children, onClose, footer }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <header>
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Close">
            ×
          </button>
        </header>
        <div className="body">{children}</div>
        {footer ? <footer>{footer}</footer> : null}
      </div>
    </div>
  );
}
