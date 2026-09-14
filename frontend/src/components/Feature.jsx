function Feature() {
  return (
    <section className="features">
      <div className="features-container">
        <div className="features-header">
          <h3 className="features-title">Why Choose AI Evaluation?</h3>
          <p className="features-description">
            Experience the future of educational assessment with consistent,
            fair, and detailed evaluation powered by artificial intelligence.
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.07 2.07 0 0 1-2.44-2.44 2.5 2.5 0 0 1-1.96-3 2.5 2.5 0 0 1 .44-4.96A2.5 2.5 0 0 1 9.5 2z" />
                </svg>
              </div>
              <h4 className="feature-title">AI-Powered Evaluation</h4>
            </div>
            <div className="feature-content">
              <p className="feature-description">Advanced AI algorithms provide accurate and consistent grading</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h4 className="feature-title">Instant Feedback</h4>
            </div>
            <div className="feature-content">
              <p className="feature-description">Students receive detailed feedback after teacher review</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H18a2 2 0 0 1 2 2v18l-4-3-4 3-4-3-4 3z" />
                  <path d="M9 9h6M9 13h6" />
                </svg>
              </div>
              <h4 className="feature-title">Comprehensive Analysis</h4>
            </div>
            <div className="feature-content">
              <p className="feature-description">Detailed rubric-based evaluation with improvement suggestions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Feature;
