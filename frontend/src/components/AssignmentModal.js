import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./StudentAssignmentModal.css";
import { formatDate, formatDateTime, wordCount } from "../utils/dates";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api/client";
import { clearLocalDraft, draftStorageKey, readLocalDraft } from "../utils/drafts";
import ConfirmDialog from "../ui/ConfirmDialog";
import { Icons } from "../ui/icons";
import { useEscape } from "../ui/useEscape";

function AssignmentModal({ assignment, onClose, onSubmit }) {
  const { user } = useAuth();
  const [answer, setAnswer] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);
  const saveTimer = useRef(null);
  const hydrating = useRef(true);
  const answerRef = useRef("");
  const typedDuringHydrate = useRef(false);

  const words = wordCount(answer);
  const minWords = Math.max(40, Math.round(Number(assignment?.maxMarks || 10) * 8));
  const maxWords = Math.max(minWords + 40, Math.round(Number(assignment?.maxMarks || 10) * 25));

  const persistLocal = (text) => {
    if (!user?.id || !assignment?._id) return;
    const key = draftStorageKey(user.id, assignment._id);
    if (!key) return;
    const payload = { answer: text, savedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(payload));
    setSavedAt(payload.savedAt);
  };

  const saveToServer = (text) => {
    if (!assignment?._id) return;
    api(`/api/drafts/${assignment._id}`, {
      method: "PUT",
      body: JSON.stringify({ answer: text })
    }).then((data) => {
      setSavedAt(data.updatedAt || new Date().toISOString());
    }).catch(() => {});
  };

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  useEffect(() => {
    if (!assignment || !user?.id) return undefined;
    let cancelled = false;
    hydrating.current = true;
    typedDuringHydrate.current = false;
    const local = readLocalDraft(user.id, assignment._id);
    if (local?.answer) {
      setAnswer(local.answer);
      setSavedAt(local.savedAt);
    }
    api(`/api/drafts/${assignment._id}`)
      .then((data) => {
        if (cancelled || typedDuringHydrate.current || !data?.answer) return;
        const localTime = local?.savedAt ? new Date(local.savedAt).getTime() : 0;
        const serverTime = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;
        if (!local?.answer || serverTime >= localTime) {
          setAnswer(data.answer);
          setSavedAt(data.updatedAt);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (cancelled) return;
        hydrating.current = false;
        const text = answerRef.current;
        if (String(text || "").trim()) {
          persistLocal(text);
          saveToServer(text);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment, user?.id]);

  useEffect(() => {
    if (!assignment || hydrating.current) return undefined;
    setDirty(true);
    persistLocal(answer);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveToServer(answer), 1200);
    return () => clearTimeout(saveTimer.current);
    // persistLocal/saveToServer close over the current assignment/user
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer, assignment, user?.id]);

  useEffect(() => {
    const onBeforeUnload = (event) => {
      if (!dirty || !answer.trim()) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, answer]);

  const guidance = useMemo(
    () => `Aim for about ${minWords}–${maxWords} words for a ${assignment?.maxMarks}-mark answer.`,
    [assignment?.maxMarks, minWords, maxWords]
  );

  const requestClose = useCallback(() => {
    if (answer.trim() && dirty) {
      setCloseConfirm(true);
      return;
    }
    onClose();
  }, [answer, dirty, onClose]);

  useEscape(Boolean(assignment) && !confirming && !closeConfirm, requestClose);

  if (!assignment) return null;

  const handleSubmit = () => {
    if (answer.trim() === "") {
      alert("Please write an answer before submitting.");
      return;
    }
    setConfirming(true);
  };

  const confirmSubmit = async () => {
    await onSubmit(assignment._id, answer);
    if (user?.id) {
      clearLocalDraft(user.id, assignment._id);
      api(`/api/drafts/${assignment._id}`, { method: "DELETE" }).catch(() => {});
    }
    setDirty(false);
    setConfirming(false);
  };

  return (
    <div className="ui-dialog-overlay student-my-modal-overlay" onClick={requestClose}>
      <div className="ui-dialog student-my-modal-content" role="dialog" aria-modal="true" aria-labelledby="assignment-modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="ui-dialog-header student-my-modal-header">
          <h2 id="assignment-modal-title">{assignment.title}</h2>
          <button type="button" className="ui-icon-btn student-my-modal-close" onClick={requestClose} aria-label="Close assignment dialog">
            {Icons.Close()}
          </button>
        </div>
        <div className="student-my-modal-body">
          <div className="student-my-assignment-details">
            <p><strong>Subject:</strong> {assignment.subject}</p>
            <p><strong>Max Marks:</strong> {assignment.maxMarks}</p>
            <p><strong>Due Date:</strong> {formatDate(assignment.dueDate)}</p>
          </div>
          <div className="student-my-assignment-question">
            <h4>Question</h4>
            <p>{assignment.text}</p>
          </div>
          <div className="student-my-assignment-answer">
            <label htmlFor="student-answer"><h4>Your Answer</h4></label>
            <p className="student-answer-guidance">{guidance}</p>
            <textarea
              id="student-answer"
              className="student-my-answer-textarea"
              placeholder="Write your answer here. A draft is saved automatically."
              value={answer}
              onChange={(e) => {
                typedDuringHydrate.current = true;
                const text = e.target.value;
                setAnswer(text);
                persistLocal(text);
              }}
              rows="10"
            />
            <div className="student-answer-meta ui-live" aria-live="polite">
              <span>{words} word{words === 1 ? "" : "s"} · {answer.length} characters</span>
              <span>{savedAt ? `Draft saved ${formatDateTime(savedAt)}` : "Draft not saved yet"}</span>
            </div>
          </div>
        </div>
        <div className="student-my-modal-footer">
          <button type="button" className="ui-btn ui-btn-secondary student-my-btn student-my-btn-secondary" onClick={requestClose}>Cancel</button>
          <button type="button" className="ui-btn ui-btn-primary student-my-btn student-my-btn-primary" onClick={handleSubmit}>Submit Answer</button>
        </div>
        <ConfirmDialog
          open={confirming}
          title="Submit this answer?"
          description={`You cannot edit it after submitting. Word count: ${words}.`}
          confirmLabel="Confirm submission"
          cancelLabel="Keep editing"
          onCancel={() => setConfirming(false)}
          onConfirm={confirmSubmit}
        />
        <ConfirmDialog
          open={closeConfirm}
          title="Close this draft?"
          description="You have an unsaved or unsubmitted answer. Your draft will stay saved."
          confirmLabel="Close anyway"
          cancelLabel="Keep editing"
          onCancel={() => setCloseConfirm(false)}
          onConfirm={onClose}
        />
      </div>
    </div>
  );
}

export default AssignmentModal;
