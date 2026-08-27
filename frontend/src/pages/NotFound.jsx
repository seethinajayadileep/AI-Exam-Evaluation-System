import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="kicker">404</div>
      <h1>This page left the exam hall.</h1>
      <p className="muted" style={{ margin: "1rem 0 1.5rem" }}>
        The route does not exist. Head back to the landing page or sign in to a dashboard.
      </p>
      <Link className="btn btn-primary" to="/">
        Return home
      </Link>
    </div>
  );
}
