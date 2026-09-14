import React, { useRef, useState } from "react";
import TeacherDashBoardQuestion from "../components/TeacherDashBoardQuestion";
import TeacherUploadQuestion from "../components/TeacherUploadQuestion";
import TeacherSubmissionButton from "../components/TeacherSubmissionButton";
import AppShell from "../ui/AppShell";
import ConfirmDialog from "../ui/ConfirmDialog";
import { Icons } from "../ui/icons";
import "./TeacherDashBoard.css";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Icons.Dashboard() },
  { id: "upload", label: "Create assignment", icon: Icons.Upload() },
  { id: "submission", label: "View submissions", icon: Icons.Document() }
];

function TeacherDashBoard() {
  const [display, setDisplay] = useState("dashboard");
  const [searchItems, setSearchItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);
  const [pendingMeta, setPendingMeta] = useState(null);
  const [focus, setFocus] = useState(null);
  const dirtyRef = useRef(false);

  const applyNavigate = (tab, meta) => {
    setDisplay(tab);
    setFocus(meta ? { ...meta, at: Date.now() } : null);
  };

  const requestNavigate = (tab, meta) => {
    if (dirtyRef.current && display === "upload" && tab !== "upload") {
      setPendingTab(tab);
      setPendingMeta(meta || null);
      setLeaveOpen(true);
      return;
    }
    applyNavigate(tab, meta);
  };

  const handleIndexChange = ({ searchItems: items, notifications: notes }) => {
    setSearchItems(items);
    setNotifications(notes);
  };

  let displayedContent;
  if (display === "upload") {
    displayedContent = (
      <TeacherUploadQuestion
        onDirtyChange={(dirty) => {
          dirtyRef.current = dirty;
        }}
        onPublished={() => {
          dirtyRef.current = false;
          setDisplay("dashboard");
          setFocus(null);
        }}
      />
    );
  } else if (display === "submission") {
    displayedContent = <TeacherSubmissionButton onIndexChange={handleIndexChange} focus={focus} />;
  } else {
    displayedContent = (
      <TeacherDashBoardQuestion
        onNavigate={requestNavigate}
        onIndexChange={handleIndexChange}
        focus={focus}
      />
    );
  }

  return (
    <>
      <AppShell
        role="teacher"
        title="Teacher Dashboard"
        navItems={NAV_ITEMS}
        activeTab={display}
        onNavigate={requestNavigate}
        searchItems={searchItems}
        notifications={notifications}
      >
        {displayedContent}
      </AppShell>
      <ConfirmDialog
        open={leaveOpen}
        title="Leave without publishing?"
        description="Unsaved assignment details will stay in this form only if you stay on Create assignment."
        confirmLabel="Leave page"
        cancelLabel="Keep editing"
        tone="danger"
        onCancel={() => {
          setLeaveOpen(false);
          setPendingTab(null);
          setPendingMeta(null);
        }}
        onConfirm={() => {
          dirtyRef.current = false;
          setLeaveOpen(false);
          if (pendingTab) applyNavigate(pendingTab, pendingMeta);
          setPendingTab(null);
          setPendingMeta(null);
        }}
      />
    </>
  );
}

export default TeacherDashBoard;
