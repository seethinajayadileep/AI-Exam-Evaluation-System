require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createStore } = require("./lib/store");
const { evaluateAnswer } = require("./lib/evaluate");
const { login, verify, demoAccounts } = require("./lib/auth");

const app = express();
const PORT = process.env.PORT || 5038;

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: "1mb" }));

function authOptional(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  req.user = token ? verify(token) : null;
  next();
}

function stripForStudent(doc) {
  if (!doc) return doc;
  const copy = { ...doc };
  delete copy.modelAnswer;
  return copy;
}

function serialize(doc, user) {
  if (!doc) return doc;
  const json = { ...doc, _id: String(doc._id) };
  if (user && user.role === "teacher") return json;
  return stripForStudent(json);
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function computeAnalytics(items) {
  const total = items.length;
  const submitted = items.filter((item) => item.submittedAnswer).length;
  const graded = items.filter((item) => item.status === "graded");
  const pendingGrading = items.filter((item) => item.status === "submitted").length;
  const pendingStudents = items.filter((item) => item.status === "pending").length;
  const avg =
    graded.length > 0
      ? Math.round(
          (graded.reduce((sum, item) => sum + (Number(item.score) || 0) / Math.max(item.maxMarks || 1, 1), 0) /
            graded.length) *
            100
        )
      : 0;

  const bySubject = {};
  items.forEach((item) => {
    const key = item.subject || "general";
    if (!bySubject[key]) {
      bySubject[key] = { subject: key, questions: 0, graded: 0, submitted: 0, totalScorePct: 0 };
    }
    bySubject[key].questions += 1;
    if (item.submittedAnswer) bySubject[key].submitted += 1;
    if (item.status === "graded" && item.maxMarks) {
      bySubject[key].graded += 1;
      bySubject[key].totalScorePct += (Number(item.score) || 0) / item.maxMarks;
    }
  });

  const subjects = Object.values(bySubject).map((row) => ({
    subject: row.subject,
    questions: row.questions,
    submitted: row.submitted,
    graded: row.graded,
    averagePct: row.graded ? Math.round((row.totalScorePct / row.graded) * 100) : 0,
  }));

  const buckets = [
    { label: "0–39%", min: 0, max: 0.39, count: 0 },
    { label: "40–59%", min: 0.4, max: 0.59, count: 0 },
    { label: "60–74%", min: 0.6, max: 0.74, count: 0 },
    { label: "75–89%", min: 0.75, max: 0.89, count: 0 },
    { label: "90–100%", min: 0.9, max: 1, count: 0 },
  ];
  graded.forEach((item) => {
    const ratio = (Number(item.score) || 0) / Math.max(item.maxMarks || 1, 1);
    const bucket = buckets.find((entry) => ratio >= entry.min && ratio <= entry.max) || buckets[0];
    bucket.count += 1;
  });

  return {
    totalQuestions: total,
    submitted,
    graded: graded.length,
    pendingGrading,
    pendingStudents,
    averagePct: avg,
    subjects,
    distribution: buckets.map(({ label, count }) => ({ label, count })),
  };
}

async function start() {
  const { store, mode } = await createStore();
  app.locals.store = store;
  app.locals.mode = mode;

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      mode,
      gemini: Boolean((process.env.GOOGLE_API_KEY || "").trim()),
      time: new Date().toISOString(),
    });
  });

  app.get("/auth/demo", (_req, res) => {
    res.json({ accounts: demoAccounts() });
  });

  app.post("/auth/login", (req, res) => {
    const { email, password } = req.body || {};
    const result = login(email, password);
    if (!result) return res.status(401).json({ message: "Invalid email or password." });
    res.json(result);
  });

  app.get("/auth/me", authOptional, (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Not signed in." });
    res.json({ user: { email: req.user.email, role: req.user.role, name: req.user.name } });
  });

  app.get("/assignments", authOptional, async (req, res) => {
    try {
      const items = await store.list();
      res.json(items.map((item) => serialize(item, req.user)));
    } catch (error) {
      res.status(500).json({ message: "Failed to load assignments", error: error.message });
    }
  });

  app.get("/analytics", authOptional, async (_req, res) => {
    try {
      const items = await store.list();
      res.json(computeAnalytics(items));
    } catch (error) {
      res.status(500).json({ message: "Failed to load analytics", error: error.message });
    }
  });

  app.post("/assignments/add", authOptional, async (req, res) => {
    try {
      const { questionTitle, questionText, modelAnswer, maxMarks, subject, dueDate } = req.body || {};
      if (!questionTitle || !questionText || !subject || !dueDate) {
        return res.status(400).json({ message: "Title, question, subject, and due date are required." });
      }
      const created = await store.insert({
        title: questionTitle,
        text: questionText,
        modelAnswer: modelAnswer || "",
        maxMarks: Number(maxMarks) || 10,
        subject,
        dueDate,
        status: "pending",
        submittedAnswer: null,
        submittedAt: null,
        studentName: null,
        score: null,
        feedback: null,
        evaluation: null,
        createdAt: todayStamp(),
      });
      res.status(201).json({
        message: "Question uploaded successfully.",
        assignmentId: created._id,
        assignment: serialize(created, req.user || { role: "teacher" }),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload question", error: error.message });
    }
  });

  app.put("/assignments/:id", authOptional, async (req, res) => {
    const { id } = req.params;
    const body = req.body || {};
    try {
      const existing = await store.get(id);
      if (!existing) return res.status(404).json({ message: "Assignment not found" });

      const patch = {};
      if (body.questionTitle !== undefined) patch.title = body.questionTitle;
      if (body.questionText !== undefined) patch.text = body.questionText;
      if (body.modelAnswer !== undefined) patch.modelAnswer = body.modelAnswer;
      if (body.maxMarks !== undefined) patch.maxMarks = Number(body.maxMarks);
      if (body.subject !== undefined) patch.subject = body.subject;
      if (body.dueDate !== undefined) patch.dueDate = body.dueDate;

      if (body.submittedAnswer !== undefined) {
        patch.submittedAnswer = body.submittedAnswer;
        patch.status = "submitted";
        patch.submittedAt = todayStamp();
        patch.studentName = (req.user && req.user.name) || body.studentName || "Alex Kumar";
      }
      if (body.score !== undefined) {
        patch.score = Number(body.score);
        patch.status = "graded";
      }
      if (body.feedback !== undefined) {
        patch.feedback = body.feedback;
        patch.status = "graded";
      }
      if (body.evaluation !== undefined) patch.evaluation = body.evaluation;

      if (!Object.keys(patch).length) {
        return res.status(400).json({ message: "No fields to update." });
      }

      const updated = await store.update(id, patch);
      res.json({ message: "Assignment updated successfully.", assignment: serialize(updated, req.user) });
    } catch (error) {
      res.status(500).json({ message: "Failed to update assignment", error: error.message });
    }
  });

  app.post("/assignments/:id/submit", authOptional, async (req, res) => {
    const { id } = req.params;
    const answer = (req.body && req.body.submittedAnswer) || "";
    if (!String(answer).trim()) {
      return res.status(400).json({ message: "Answer text is required." });
    }
    try {
      const existing = await store.get(id);
      if (!existing) return res.status(404).json({ message: "Assignment not found" });

      const studentName = (req.user && req.user.name) || req.body.studentName || "Alex Kumar";
      await store.update(id, {
        submittedAnswer: answer,
        status: "submitted",
        submittedAt: todayStamp(),
        studentName,
        score: null,
        feedback: null,
        evaluation: null,
      });

      const result = await evaluateAnswer({
        question: existing.text,
        modelAnswer: existing.modelAnswer,
        studentAnswer: answer,
        maxMarks: existing.maxMarks,
      });

      const graded = await store.update(id, {
        status: "graded",
        score: result.score,
        feedback: result.feedback,
        evaluation: result.evaluation,
      });

      res.json({
        message: "Answer submitted and graded.",
        assignment: serialize(graded, req.user),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit answer", error: error.message });
    }
  });

  app.post("/assignments/:id/evaluate", authOptional, async (req, res) => {
    const { id } = req.params;
    try {
      const existing = await store.get(id);
      if (!existing) return res.status(404).json({ message: "Assignment not found" });
      if (!existing.submittedAnswer) {
        return res.status(400).json({ message: "No student answer to evaluate yet." });
      }
      const result = await evaluateAnswer({
        question: existing.text,
        modelAnswer: existing.modelAnswer,
        studentAnswer: existing.submittedAnswer,
        maxMarks: existing.maxMarks,
      });
      const graded = await store.update(id, {
        status: "graded",
        score: result.score,
        feedback: result.feedback,
        evaluation: result.evaluation,
      });
      res.json({
        message: "Evaluation complete.",
        assignment: serialize(graded, req.user || { role: "teacher" }),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to evaluate answer", error: error.message });
    }
  });

  app.post("/seed", authOptional, async (_req, res) => {
    try {
      const count = await store.reset();
      res.json({ message: `Demo data restored (${count} questions).` });
    } catch (error) {
      res.status(500).json({ message: "Failed to seed data", error: error.message });
    }
  });

  app.delete("/assignments/:id", authOptional, async (req, res) => {
    try {
      const ok = await store.remove(req.params.id);
      if (!ok) return res.status(404).json({ message: "Assignment not found" });
      res.json({ message: "Question deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete question", error: error.message });
    }
  });

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  });

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT} (${mode} store)`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
