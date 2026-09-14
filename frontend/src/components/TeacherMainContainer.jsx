import TeacherSideBar from "./TeacherSideBar";
import React, { useState } from "react";
import TeacherDashBoardQuestion from "./TeacherDashBoardQuestion";
import TeacherUploadQuestion from "./TeacherUploadQuestion";
import TeacherSubmissionButton from "./TeacherSubmissionButton";

function TeacherMainContainer({ isClicked, onCloseSidebar }) {
  const [display, setDisplay] = useState("dashboard");

  const handleNavigate = (message) => {
    setDisplay(message);
    if (typeof window !== "undefined" && window.innerWidth <= 1024 && onCloseSidebar) {
      onCloseSidebar();
    }
  };

  let displayedContent;
  if (display === "upload") {
    displayedContent = <TeacherUploadQuestion />;
  } else if (display === "submission") {
    displayedContent = <TeacherSubmissionButton />;
  } else {
    displayedContent = <TeacherDashBoardQuestion onNavigate={handleNavigate} />;
  }

  return (
    <div className="teacher-ai-main-container">
      {isClicked && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation menu"
          onClick={onCloseSidebar}
        />
      )}
      <TeacherSideBar ButtonClicked={handleNavigate} activeTab={display} isOpen={isClicked} />
      <div className={`teacher-ai-main-content ${isClicked ? "" : "sidebar-collapsed"}`}>
        {displayedContent}
      </div>
    </div>
  );
}

export default TeacherMainContainer;
