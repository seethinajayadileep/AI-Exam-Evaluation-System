import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import TeacherApp from "./pages/TeacherApp";
import StudentApp from "./pages/StudentApp";
import NotFound from "./pages/NotFound";

function RoleGate({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={`/login?role=${role}`} replace />;
  if (user.role !== role) return <Navigate to={user.role === "teacher" ? "/teacher" : "/student"} replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/teacher"
              element={
                <RoleGate role="teacher">
                  <TeacherApp />
                </RoleGate>
              }
            />
            <Route
              path="/student"
              element={
                <RoleGate role="student">
                  <StudentApp />
                </RoleGate>
              }
            />
            <Route path="/TeacherDashBoard" element={<Navigate to="/teacher" replace />} />
            <Route path="/StudentDashBoard" element={<Navigate to="/student" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
