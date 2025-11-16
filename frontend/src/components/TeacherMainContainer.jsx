import TeacherSideBar from "./TeacherSideBar";
import React, { useState } from "react";
import  TeacherDashBoardQuestion from './TeacherDashBoardQuestion'
import TeacherUploadQuestion from "./TeacherUploadQuestion";
import TeacherSubmissionButton from "./TeacherSubmissionButton";


function TeacherMainContainer({isClicked}){
  const [display,setDisplay]=useState("dashboard");

const handleSideButton=(message)=>{
  console.log(message);
  setDisplay(message);
}


const handleDashboardNavigation = (message) => {
  setDisplay(message);
}

let DisplayedContent;
  if (display === "upload") {
    DisplayedContent = <TeacherUploadQuestion />;
  } else if (display === "submission") {
    DisplayedContent = <TeacherSubmissionButton />;
  } else {
    
    DisplayedContent = <TeacherDashBoardQuestion onNavigate={handleDashboardNavigation} />;
  }

  let element;
  if(isClicked){
    element=<TeacherSideBar ButtonClicked={handleSideButton}/>;
  }
  else{
    element=<div></div>;
  }
return (
   <div className="teacher-ai-main-container">
     {element}
     <div className="teacher-ai-main-content">
       {DisplayedContent}
     </div>
   </div>
)
}
export default TeacherMainContainer;