import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

function ProtectedRoute({ role, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <p className="auth-loading">Checking your session…</p>;
  }

  if (!user) {
    return <Navigate to={`/login?role=${role || ""}`} replace state={{ from: location }} />;
  }

  if (role && user.role !== role) {
    const home = user.role === "teacher" ? "/TeacherDashBoard" : "/StudentDashBoard";
    return <Navigate to={home} replace />;
  }

  return children;
}

export default ProtectedRoute;
