import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import TeacherDashBoard from "./pages/TeacherDashBoard";
import StudentDashBoard from "./pages/StudentDashBoard";
import { AuthProvider } from "./auth/AuthContext";
import { ThemeProvider } from "./theme/ThemeContext";
import { ToastProvider } from "./ui/ToastContext";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/TeacherDashBoard"
                element={
                  <ProtectedRoute role="teacher">
                    <TeacherDashBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/StudentDashBoard"
                element={
                  <ProtectedRoute role="student">
                    <StudentDashBoard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
