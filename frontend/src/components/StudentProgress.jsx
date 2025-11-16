import React, { useState, useEffect } from 'react';

function StudentProgress() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [overallPerformance, setOverallPerformance] = useState(0);
    const [subjectPerformance, setSubjectPerformance] = useState({});

    
    const achievements = [
        {
            id: 1,
            icon: "🏆", 
            title: "Top Performer",
            description: "Scored highest in Mathematics test",
            date: "Jan 15"
        },
        {
            id: 2,
            icon: "⭐", 
            title: "Perfect Score",
            description: "100% in Science assignment",
            date: "Jan 10"
        },
        {
            id: 3,
            icon: "🎯", 
            title: "Consistent Performance",
            description: "5 consecutive assignments above 80%",
            date: "Jan 5"
        }
    ];

   
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
               
                const response = await fetch('https://backend-ai-subjective-exam-evaluato.vercel.app/assignments');
                if (!response.ok) {
                    const errorText = await response.text();
                    
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }
                const data = await response.json();
                setAssignments(data);
            } catch (err) {
                console.error("Failed to fetch assignments for progress:", err);
                
                setError("Could not load assignments. Check network connection or API status.");
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, []);

    
    useEffect(() => {
        if (assignments.length > 0) {

           
            const gradedAssignments = assignments.filter(a => a.status === 'graded' && a.score !== null && a.maxMarks > 0);
            
           
            if (gradedAssignments.length > 0) {
                const totalScore = gradedAssignments.reduce((sum, a) => sum + a.score, 0);
                const totalMaxMarks = gradedAssignments.reduce((sum, a) => sum + a.maxMarks, 0);
                
                if (totalMaxMarks > 0) {
                   
                    setOverallPerformance(Math.round((totalScore / totalMaxMarks) * 100));
                } else {
                    setOverallPerformance(0);
                }
            } else {
                setOverallPerformance(0);
            }

           
            const subjectScores = {};
            const subjectMaxMarks = {};

            gradedAssignments.forEach(assignment => {
               
                const subjectKey = assignment.subject.toLowerCase(); 

                if (!subjectScores[subjectKey]) {
                    subjectScores[subjectKey] = 0;
                    subjectMaxMarks[subjectKey] = 0;
                }
                subjectScores[subjectKey] += assignment.score;
                subjectMaxMarks[subjectKey] += assignment.maxMarks;
            });

            const calculatedSubjectPerformance = {};
            for (const subjectKey in subjectScores) {
                if (subjectMaxMarks[subjectKey] > 0) {
                    calculatedSubjectPerformance[subjectKey] = Math.round((subjectScores[subjectKey] / subjectMaxMarks[subjectKey]) * 100);
                } else {
                    calculatedSubjectPerformance[subjectKey] = 0;
                }
            }
            setSubjectPerformance(calculatedSubjectPerformance);

        } else {
            setOverallPerformance(0);
            setSubjectPerformance({});
        }
    }, [assignments]);

    
    if (loading) {
        return (
            <div className="student-tab-content" id="progress">
                <p>Loading academic progress...</p>
            </div>
        );
    }

    
    if (error) {
        return (
            <div className="student-tab-content" id="progress">
                <p>Error: {error}</p>
            </div>
        );
    }
    
    
    const formatSubjectName = (subject) => {
        if (!subject) return '';
        
        if (subject.toLowerCase() === 'programming') return 'Programming';
        return subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
    };


    return (
        <>
            <div className="student-tab-content" id="progress">
                <div className="student-content-header">
                    <h2>Academic Progress</h2>
                </div>
                <div className="student-progress-section">
                    <div className="student-progress-cards">
                        {}
                        <div className="student-progress-card">
                            <h4>Overall Performance</h4>
                            <div className="student-progress-circle">
                                
                                <div className="student-circle-progress" data-progress={overallPerformance}>
                                    <span className="student-progress-value">{overallPerformance}%</span>
                                </div>
                            </div>
                            <p>Performance based on graded assignments</p>
                        </div>

                       
                        <div className="student-subject-progress">
                            <h4>Subject-wise Performance</h4>
                            <div className="student-subject-bars">
                                {Object.keys(subjectPerformance).length > 0 ? (
                                   
                                    Object.entries(subjectPerformance).map(([subject, score]) => (
                                        <div key={subject} className="student-subject-bar">
                                            <div className="student-subject-info">
                                                {/*helper function for correct capitalization */}
                                                <span>{formatSubjectName(subject)}</span>
                                                <span>{score}%</span>
                                            </div>
                                            <div className="student-progress-bar">
                                                <div className="student-progress-fill" style={{ width: `${score}%` }}></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No graded assignments to show subject progress.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Achievements Card */}
                    <div className="student-achievements">
                        <h4>Recent Achievements</h4>
                        <div className="student-achievement-list">
                            {achievements.length > 0 ? (
                                achievements.map(achievement => (
                                    <div key={achievement.id} className="student-achievement-item">
                                        <div className="student-achievement-icon">{achievement.icon}</div>
                                        <div className="student-achievement-info">
                                            <h5>{achievement.title}</h5>
                                            <p>{achievement.description}</p>
                                        </div>
                                        <div className="student-achievement-date">{achievement.date}</div>
                                    </div>
                                ))
                            ) : (
                                <p>No recent achievements.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default StudentProgress;