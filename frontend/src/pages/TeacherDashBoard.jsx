import './TeacherDashBoard.css';
import TeacherHeader from '../components/TeacherHeader';
import TeacherSideBar from '../components/TeacherSideBar';
import TeacherMainContainer from '../components/TeacherMainContainer';
import React, { useState } from 'react';
function TeacherDashBoard(){
   const [toggleState, setToggleState] = useState(0);
  const SideBar=()=>{
    setToggleState(prev => (prev === 0 ? 1 : 0));
   
    
   
  }
    return (
        <>
       <div class="Teacher-ai-div">
       <TeacherHeader onButtonClick={SideBar}/>
     <TeacherMainContainer isClicked={toggleState}/>
      </div>
      
      </>
    )

}
export default TeacherDashBoard;