function StudentHeader({onButtonClick}){
    const  HandleSideBar=()=>{
        onButtonClick();
    }
return (
    <>
     <header class="student-header">
        <div class="student-header-content">
            <div class="student-header-left">
                <button class="student-sidebar-toggle" id="sidebarToggle" onClick={HandleSideBar}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                </button>
                <div class="student-logo">
                    <svg class="student-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H18a2 2 0 0 1 2 2v18l-4-3-4 3-4-3-4 3z"/>
                        <path d="M9 9h6M9 13h6"/>
                    </svg>
                </div>
                <div class="student-header-title">
                    <h1>AI Subjective Exam Evaluator</h1>
                    <p class="student-header-subtitle">Student Dashboard</p>
                </div>
            </div>
            <div class="student-header-right">
                <div class="student-user-info">
                    <p class="student-user-name">Welcome, Alex Johnson</p>
                    <p class="student-user-role">Student</p>
                </div>
                <button class="student-logout-btn" onclick="logout()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                    </svg>
                    Logout
                </button>
            </div>
        </div>
    </header>
    </>
)
}
export default StudentHeader;