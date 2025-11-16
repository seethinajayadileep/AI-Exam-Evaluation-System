import React from 'react';
import { useNavigate } from 'react-router-dom';

function Hero() {
  const navigate = useNavigate();

  const selectRole = (role) => {
    if (role === 'teacher') {
      navigate('/TeacherDashboard');
    } else if (role === 'student') {
      navigate('/StudentDashboard');
    }
  };

  return (
    <>
      <div className="hero-container">
        <h2 className="hero-title">
          Automated Grading with 
          <span className="hero-highlight">AI-Powered Feedback</span>
        </h2>
        <p className="hero-description">
          Transform your assessment process with intelligent evaluation that provides 
          consistent, detailed feedback for subjective examinations.
        </p>

        <div className="role-cards">
          {/* Teacher Card */}
          <div className="role-card" data-role="teacher">
            <div className="role-card-header">
              <div className="role-icon teacher-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <h3 className="role-title">Teacher</h3>
            </div>
            <div className="role-card-content">
              <p className="role-description">
                Create questions, upload model answers, and review AI evaluations
              </p>
              <button
                className="role-button teacher-button"
                onClick={() => selectRole('teacher')}
              >
                Login as Teacher
                <svg className="button-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Student Card */}
          <div className="role-card" data-role="student">
            <div className="role-card-header">
              <div className="role-icon student-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="role-title">Student</h3>
            </div>
            <div className="role-card-content">
              <p className="role-description">
                Submit answers and receive instant AI-powered feedback and scores
              </p>
              <button
                className="role-button student-button"
                onClick={() => selectRole('student')}
              >
                Login as Student
                <svg className="button-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Hero;
