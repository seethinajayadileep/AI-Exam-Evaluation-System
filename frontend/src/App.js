import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import TeacherDashBoard from './pages/TeacherDashBoard';
import StudentDashBoard from './pages/StudentDashBoard';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
       <Route path="/TeacherDashBoard" element={<TeacherDashBoard />} />
         <Route path="/StudentDashBoard" element={<StudentDashBoard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
