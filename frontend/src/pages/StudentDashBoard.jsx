import React, { useState } from 'react';
import StudentHeader from "../components/StudentHeader";
import './StudentDashBoard.css';
import StudentOverview from "../components/StudentOverview";
import StudentRecentAssignments from "../components/StudentRecentAssignments";
import StudentDeadline from "../components/StudentDeadlines";
import StudentSideBar from "../components/StudentSideBar"; 
import StudentAvailableAssignments from "../components/StudentAvailableAssignments";
import StudentSubmission from "../components/StudentSubmission";
import StudentProgress from "../components/StudentProgress";

function StudentDashBoard() {
    const [toggleState, setToggleState] = useState(0);
    const SideBar = () => {
        setToggleState(prev => (prev === 0 ? 1 : 0));
    };
    const [display, setDisplay] = useState("Dashboard");
    
    function handleSideBar(message) {
        setDisplay(message);
    }
    
    
    const closeSidebar = () => {
        setToggleState(0);
    };

    let displayContent;
    if (display === "Dashboard") {
        displayContent = (
            <div className="">
                <StudentOverview onViewAssignmentsClick={() => handleSideBar("Assignments")} />
                <div className="">
                    <StudentRecentAssignments />
                    <h1 className="student-space"></h1>
                    <StudentDeadline />
                </div>
            </div>
        );
    } else if (display === "Assignments") {
        displayContent = <StudentAvailableAssignments />;
    } else if (display === "Submission") {
        displayContent = <StudentSubmission />;
    } else {
        displayContent = <StudentProgress />;
    }

    return (
        <>
            <div className="student-body">
                <StudentHeader onButtonClick={SideBar} />
                <div className="student-main-container">
                    {toggleState === 1 && (
                       
                        <StudentSideBar 
                            ButtonClicked={handleSideBar} 
                            onClose={closeSidebar} 
                        />
                    )}
                    <div className="student-main-content">
                        <div className="student-dashboard-sections">
                            {displayContent}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default StudentDashBoard;