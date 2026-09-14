require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const {
    signToken,
    publicUser,
    verifyPassword,
    authenticate,
    requireRole
} = require("./lib/auth");
const { evaluateSubmission, calibrateSamples } = require("./lib/evaluate");
const { ensureSeed } = require("./seed");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 5038;
const DBNAME = "examdb";
const connection_string = process.env.MONGO_URI;

let database;

function endOfDueDate(dueDate) {
    const date = new Date(`${dueDate}T23:59:59`);
    return date;
}

function isExpired(dueDate) {
    if (!dueDate) return false;
    return endOfDueDate(dueDate) < new Date();
}

function studentAssignmentView(assignment, submission, hasDraft = false) {
    const expired = isExpired(assignment.dueDate);
    let status = "pending";
    if (submission) {
        status = submission.status === "pending_review" ? "pending_review" : submission.status;
    } else if (expired) {
        status = "expired";
    }

    return {
        _id: assignment._id,
        title: assignment.title,
        subject: assignment.subject,
        text: assignment.text,
        maxMarks: assignment.maxMarks,
        dueDate: assignment.dueDate,
        createdAt: assignment.createdAt,
        status,
        submittedAnswer: submission?.submittedAnswer || null,
        submittedAt: submission?.submittedAt || null,
        score: submission?.status === "graded" ? submission.score : (submission?.status === "pending_review" ? null : submission?.score ?? null),
        feedback: submission?.status === "graded" ? submission.feedback : null,
        aiEvaluation: submission?.status === "graded" && !assignment.hideRubricFromStudents ? submission.aiEvaluation : (submission?.status === "graded" ? { confidence: submission.aiEvaluation?.confidence } : null),
        hideRubricFromStudents: Boolean(assignment.hideRubricFromStudents),
        submissionId: submission?._id || null,
        expired,
        canStart: !submission && !expired,
        hasDraft: Boolean(hasDraft) && !submission && !expired
    };
}

function teacherAssignmentView(assignment, submissionCount, gradedCount) {
    return {
        _id: assignment._id,
        title: assignment.title,
        subject: assignment.subject,
        text: assignment.text,
        modelAnswer: assignment.modelAnswer || "",
        rubric: assignment.rubric || [],
        maxMarks: assignment.maxMarks,
        dueDate: assignment.dueDate,
        createdAt: assignment.createdAt,
        status: isExpired(assignment.dueDate) ? "expired" : "open",
        hideRubricFromStudents: Boolean(assignment.hideRubricFromStudents),
        submissions: submissionCount,
        graded: gradedCount
    };
}

function todayIsoDate() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function validateDueDate(dueDate) {
    if (!dueDate) return "Due date is required.";
    if (String(dueDate) < todayIsoDate()) return "Due date cannot be earlier than today.";
    return null;
}

function validateRubric(rubric, maxMarks) {
    if (!Array.isArray(rubric) || !rubric.length) return "At least one rubric criterion is required.";
    for (const item of rubric) {
        if (!String(item.criterion || "").trim() || !String(item.description || "").trim() || !Number(item.maxMarks)) {
            return "Each rubric row needs a criterion, marks, and description.";
        }
    }
    const total = rubric.reduce((sum, item) => sum + Number(item.maxMarks || 0), 0);
    if (total !== Number(maxMarks)) {
        return `Rubric total (${total}) must equal maximum marks (${maxMarks}).`;
    }
    return null;
}

function stripStudentSecrets(submission, assignment) {
    const pendingAi = submission.status === "pending_review";
    const hideRubric = Boolean(assignment?.hideRubricFromStudents);
    let aiEvaluation = null;
    if (submission.status === "graded" && submission.aiEvaluation) {
        aiEvaluation = hideRubric
            ? { confidence: submission.aiEvaluation.confidence, criteria: [] }
            : submission.aiEvaluation;
    }
    return {
        ...submission,
        title: assignment?.title,
        subject: assignment?.subject,
        text: assignment?.text,
        maxMarks: assignment?.maxMarks,
        dueDate: assignment?.dueDate,
        score: submission.status === "graded" ? submission.score : null,
        feedback: submission.status === "graded" ? submission.feedback : (pendingAi ? "Your teacher is reviewing the AI evaluation." : null),
        aiEvaluation,
        hideRubricFromStudents: hideRubric,
        evaluationLog: undefined,
        modelAnswer: undefined
    };
}

function parseObjectId(id) {
    if (!ObjectId.isValid(id)) return null;
    return new ObjectId(id);
}

async function startServer() {
    const client = await MongoClient.connect(connection_string);
    database = client.db(DBNAME);
    console.log("✅ MongoDB connected successfully");

    const seedResult = await ensureSeed(database);
    if (seedResult.seeded) {
        console.log("✅ Demo data seeded", seedResult);
    }
    await database.collection("users").createIndex({ email: 1 }, { unique: true });

    const users = () => database.collection("users");
    const assignments = () => database.collection("assignments");
    const submissions = () => database.collection("submissions");
    const drafts = () => database.collection("drafts");
    await drafts().createIndex({ studentId: 1, assignmentId: 1 }, { unique: true });

    app.get("/api/health", (_req, res) => {
        res.json({ ok: true });
    });

    app.post("/api/auth/login", async (req, res) => {
        try {
            const email = String(req.body.email || "").trim().toLowerCase();
            const password = String(req.body.password || "");
            const requestedRole = req.body.role;
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required." });
            }
            const user = await users().findOne({ email });
            if (!user || !(await verifyPassword(password, user.passwordHash))) {
                return res.status(401).json({ message: "Invalid email or password." });
            }
            if (requestedRole && requestedRole !== user.role) {
                return res.status(403).json({ message: `This account is registered as a ${user.role}.` });
            }
            const token = signToken(user);
            res.json({ token, user: publicUser(user) });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "Login failed." });
        }
    });

    app.get("/api/auth/me", authenticate, async (req, res) => {
        const user = await users().findOne({ _id: new ObjectId(req.user.id) });
        if (!user) return res.status(401).json({ message: "Account not found." });
        res.json({ user: publicUser(user) });
    });

    app.get("/api/assignments", authenticate, async (req, res) => {
        try {
            const items = await assignments().find({}).sort({ createdAt: -1 }).toArray();
            if (req.user.role === "teacher") {
                const allSubs = await submissions().find({}).toArray();
                const payload = items.map((assignment) => {
                    const related = allSubs.filter((sub) => String(sub.assignmentId) === String(assignment._id));
                    const gradedCount = related.filter((sub) => sub.status === "graded").length;
                    return teacherAssignmentView(assignment, related.length, gradedCount);
                });
                return res.json(payload);
            }

            const studentId = new ObjectId(req.user.id);
            const mine = await submissions().find({ studentId }).toArray();
            const mineDrafts = await drafts().find({ studentId }).toArray();
            const byAssignment = new Map(mine.map((sub) => [String(sub.assignmentId), sub]));
            const drafted = new Set(
                mineDrafts
                    .filter((item) => String(item.answer || "").trim())
                    .map((item) => String(item.assignmentId))
            );
            const payload = items.map((assignment) =>
                studentAssignmentView(
                    assignment,
                    byAssignment.get(String(assignment._id)),
                    drafted.has(String(assignment._id))
                )
            );
            res.json(payload);
        } catch (error) {
            console.error("Error fetching assignments:", error);
            res.status(500).json({ message: "Failed to retrieve assignments." });
        }
    });

    app.post("/api/assignments", authenticate, requireRole("teacher"), async (req, res) => {
        try {
            const { questionTitle, questionText, maxMarks, subject, dueDate, modelAnswer, rubric, hideRubricFromStudents } = req.body;
            if (!questionTitle || !questionText || !subject || !dueDate || !maxMarks) {
                return res.status(400).json({ message: "Title, text, subject, due date, and marks are required." });
            }
            const dueError = validateDueDate(dueDate);
            if (dueError) return res.status(400).json({ message: dueError });
            const rubricError = validateRubric(rubric, maxMarks);
            if (rubricError) return res.status(400).json({ message: rubricError });
            const newAssignment = {
                title: questionTitle,
                subject,
                text: questionText,
                modelAnswer: modelAnswer || "",
                rubric: Array.isArray(rubric) ? rubric : [],
                hideRubricFromStudents: Boolean(hideRubricFromStudents),
                maxMarks: Number(maxMarks),
                dueDate,
                createdAt: new Date().toISOString(),
                createdBy: new ObjectId(req.user.id),
                status: "open"
            };
            const result = await assignments().insertOne(newAssignment);
            res.status(201).json({ message: "Question uploaded successfully!", assignmentId: result.insertedId });
        } catch (error) {
            console.error("Error creating assignment:", error);
            res.status(500).json({ message: "Failed to upload question." });
        }
    });

    app.put("/api/assignments/:id", authenticate, requireRole("teacher"), async (req, res) => {
        const id = parseObjectId(req.params.id);
        if (!id) return res.status(400).json({ message: "Invalid assignment ID." });
        const { questionTitle, questionText, maxMarks, subject, dueDate, modelAnswer, rubric, hideRubricFromStudents } = req.body;
        const existing = await assignments().findOne({ _id: id });
        if (!existing) return res.status(404).json({ message: "Assignment not found." });
        const updateDoc = {};
        if (questionTitle !== undefined) updateDoc.title = questionTitle;
        if (questionText !== undefined) updateDoc.text = questionText;
        if (maxMarks !== undefined) updateDoc.maxMarks = Number(maxMarks);
        if (subject !== undefined) updateDoc.subject = subject;
        if (dueDate !== undefined) {
            if (dueDate !== existing.dueDate) {
                const dueError = validateDueDate(dueDate);
                if (dueError) return res.status(400).json({ message: dueError });
            }
            updateDoc.dueDate = dueDate;
        }
        if (modelAnswer !== undefined) updateDoc.modelAnswer = modelAnswer;
        if (hideRubricFromStudents !== undefined) updateDoc.hideRubricFromStudents = Boolean(hideRubricFromStudents);
        if (rubric !== undefined) {
            const rubricError = validateRubric(rubric, maxMarks !== undefined ? Number(maxMarks) : existing.maxMarks);
            if (rubricError) return res.status(400).json({ message: rubricError });
            updateDoc.rubric = rubric;
        }
        if (!Object.keys(updateDoc).length) {
            return res.status(400).json({ message: "No fields to update." });
        }
        const result = await assignments().updateOne({ _id: id }, { $set: updateDoc });
        if (!result.matchedCount) return res.status(404).json({ message: "Assignment not found." });
        res.json({ message: "Assignment updated successfully." });
    });

    app.delete("/api/assignments/:id", authenticate, requireRole("teacher"), async (req, res) => {
        const id = parseObjectId(req.params.id);
        if (!id) return res.status(400).json({ message: "Invalid assignment ID." });
        const result = await assignments().deleteOne({ _id: id });
        if (!result.deletedCount) return res.status(404).json({ message: "Assignment not found." });
        await submissions().deleteMany({ assignmentId: id });
        await drafts().deleteMany({ assignmentId: id });
        res.json({ message: "Question deleted successfully!" });
    });

    app.post("/api/assignments/calibrate", authenticate, requireRole("teacher"), async (req, res) => {
        try {
            const { questionText, modelAnswer, rubric, maxMarks, samples } = req.body;
            if (!questionText || !maxMarks || !Array.isArray(samples) || samples.length < 2) {
                return res.status(400).json({ message: "Question text, marks, and at least two sample answers are required." });
            }
            const report = await calibrateSamples({
                question: questionText,
                modelAnswer,
                rubric,
                maxMarks: Number(maxMarks),
                samples
            });
            res.json(report);
        } catch (error) {
            console.error("Calibration error:", error);
            res.status(500).json({ message: error.message || "Calibration failed." });
        }
    });

    app.get("/api/drafts/:assignmentId", authenticate, requireRole("student"), async (req, res) => {
        const assignmentId = parseObjectId(req.params.assignmentId);
        if (!assignmentId) return res.status(400).json({ message: "Invalid assignment ID." });
        const draft = await drafts().findOne({ assignmentId, studentId: new ObjectId(req.user.id) });
        res.json(draft || { answer: "", updatedAt: null });
    });

    app.put("/api/drafts/:assignmentId", authenticate, requireRole("student"), async (req, res) => {
        const assignmentId = parseObjectId(req.params.assignmentId);
        if (!assignmentId) return res.status(400).json({ message: "Invalid assignment ID." });
        const answer = String(req.body.answer || "");
        const updatedAt = new Date().toISOString();
        await drafts().updateOne(
            { assignmentId, studentId: new ObjectId(req.user.id) },
            {
                $set: {
                    assignmentId,
                    studentId: new ObjectId(req.user.id),
                    answer,
                    updatedAt
                }
            },
            { upsert: true }
        );
        res.json({ message: "Draft saved.", updatedAt });
    });

    app.delete("/api/drafts/:assignmentId", authenticate, requireRole("student"), async (req, res) => {
        const assignmentId = parseObjectId(req.params.assignmentId);
        if (!assignmentId) return res.status(400).json({ message: "Invalid assignment ID." });
        await drafts().deleteOne({ assignmentId, studentId: new ObjectId(req.user.id) });
        res.json({ message: "Draft cleared." });
    });

    app.get("/api/submissions", authenticate, async (req, res) => {
        try {
            const query = req.user.role === "student" ? { studentId: new ObjectId(req.user.id) } : {};
            const items = await submissions().find(query).sort({ submittedAt: -1 }).toArray();
            const assignmentIds = items.map((item) => item.assignmentId);
            const related = await assignments().find({ _id: { $in: assignmentIds } }).toArray();
            const map = new Map(related.map((item) => [String(item._id), item]));
            const payload = items.map((item) => {
                const assignment = map.get(String(item.assignmentId));
                if (req.user.role === "student") {
                    return stripStudentSecrets(item, assignment);
                }
                return {
                    ...item,
                    title: assignment?.title,
                    subject: assignment?.subject,
                    text: assignment?.text,
                    maxMarks: assignment?.maxMarks,
                    dueDate: assignment?.dueDate,
                    modelAnswer: assignment?.modelAnswer || "",
                    rubric: assignment?.rubric || [],
                    hideRubricFromStudents: Boolean(assignment?.hideRubricFromStudents)
                };
            });
            res.json(payload);
        } catch (error) {
            console.error("Error fetching submissions:", error);
            res.status(500).json({ message: "Failed to retrieve submissions." });
        }
    });

    app.post("/api/submissions", authenticate, requireRole("student"), async (req, res) => {
        try {
            const assignmentId = parseObjectId(req.body.assignmentId);
            const submittedAnswer = String(req.body.submittedAnswer || "").trim();
            if (!assignmentId || !submittedAnswer) {
                return res.status(400).json({ message: "Assignment and answer are required." });
            }
            const assignment = await assignments().findOne({ _id: assignmentId });
            if (!assignment) return res.status(404).json({ message: "Assignment not found." });
            if (isExpired(assignment.dueDate)) {
                return res.status(400).json({ message: "This assignment has expired and can no longer be started." });
            }
            const existing = await submissions().findOne({
                assignmentId,
                studentId: new ObjectId(req.user.id)
            });
            if (existing) {
                return res.status(409).json({ message: "You have already submitted this assignment." });
            }
            const now = new Date().toISOString();
            const doc = {
                assignmentId,
                studentId: new ObjectId(req.user.id),
                studentName: req.user.name,
                submittedAnswer,
                submittedAt: now,
                status: "submitted",
                score: null,
                feedback: null,
                aiEvaluation: null,
                gradedAt: null,
                gradedBy: null,
                evaluationLog: [
                    { action: "submitted", actorId: req.user.id, actorName: req.user.name, timestamp: now, details: {} }
                ]
            };
            const result = await submissions().insertOne(doc);
            await drafts().deleteOne({ assignmentId, studentId: new ObjectId(req.user.id) });
            res.status(201).json({ message: "Answer submitted successfully.", submissionId: result.insertedId });
        } catch (error) {
            console.error("Error submitting answer:", error);
            res.status(500).json({ message: "Failed to submit answer." });
        }
    });

    app.post("/api/submissions/:id/evaluate", authenticate, requireRole("teacher"), async (req, res) => {
        try {
            const id = parseObjectId(req.params.id);
            if (!id) return res.status(400).json({ message: "Invalid submission ID." });
            const submission = await submissions().findOne({ _id: id });
            if (!submission) return res.status(404).json({ message: "Submission not found." });
            const assignment = await assignments().findOne({ _id: submission.assignmentId });
            if (!assignment) return res.status(404).json({ message: "Assignment not found." });

            const evaluation = await evaluateSubmission({
                question: assignment.text,
                modelAnswer: assignment.modelAnswer,
                rubric: assignment.rubric,
                studentAnswer: submission.submittedAnswer,
                maxMarks: assignment.maxMarks
            });

            const now = new Date().toISOString();
            const logEntry = {
                action: "ai_evaluate",
                actorId: req.user.id,
                actorName: req.user.name,
                timestamp: now,
                details: { score: evaluation.score, confidence: evaluation.confidence, model: evaluation.rawModel }
            };

            await submissions().updateOne(
                { _id: id },
                {
                    $set: {
                        status: "pending_review",
                        score: evaluation.score,
                        feedback: evaluation.feedback,
                        aiEvaluation: evaluation
                    },
                    $push: { evaluationLog: logEntry }
                }
            );

            const updated = await submissions().findOne({ _id: id });
            res.json({
                message: "AI evaluation complete. Approve or adjust the grade.",
                submission: {
                    ...updated,
                    title: assignment.title,
                    subject: assignment.subject,
                    text: assignment.text,
                    maxMarks: assignment.maxMarks,
                    modelAnswer: assignment.modelAnswer || "",
                    rubric: assignment.rubric || []
                }
            });
        } catch (error) {
            console.error("AI evaluation error:", error);
            res.status(500).json({ message: error.message || "AI evaluation failed." });
        }
    });

    app.put("/api/submissions/:id/grade", authenticate, requireRole("teacher"), async (req, res) => {
        try {
            const id = parseObjectId(req.params.id);
            if (!id) return res.status(400).json({ message: "Invalid submission ID." });
            const submission = await submissions().findOne({ _id: id });
            if (!submission) return res.status(404).json({ message: "Submission not found." });

            const score = Number(req.body.score);
            const feedback = String(req.body.feedback || "").trim();
            const action = req.body.action === "approve" ? "approve" : "teacher_grade";
            if (Number.isNaN(score) || !feedback) {
                return res.status(400).json({ message: "Score and feedback are required." });
            }

            const assignment = await assignments().findOne({ _id: submission.assignmentId });
            const maxMarks = assignment?.maxMarks || 100;
            if (score < 0 || score > maxMarks) {
                return res.status(400).json({ message: `Score must be between 0 and ${maxMarks}.` });
            }

            const now = new Date().toISOString();
            await submissions().updateOne(
                { _id: id },
                {
                    $set: {
                        status: "graded",
                        score,
                        feedback,
                        gradedAt: now,
                        gradedBy: req.user.id
                    },
                    $push: {
                        evaluationLog: {
                            action,
                            actorId: req.user.id,
                            actorName: req.user.name,
                            timestamp: now,
                            details: { score, previousStatus: submission.status }
                        }
                    }
                }
            );
            res.json({ message: action === "approve" ? "AI grade approved." : "Grade saved." });
        } catch (error) {
            console.error("Grading error:", error);
            res.status(500).json({ message: "Failed to save grade." });
        }
    });

    app.get("/api/submissions/:id/audit", authenticate, requireRole("teacher"), async (req, res) => {
        const id = parseObjectId(req.params.id);
        if (!id) return res.status(400).json({ message: "Invalid submission ID." });
        const submission = await submissions().findOne({ _id: id });
        if (!submission) return res.status(404).json({ message: "Submission not found." });
        res.json({ evaluationLog: submission.evaluationLog || [] });
    });

    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

startServer().catch((error) => {
    console.error("❌ Failed to start server", error);
    process.exit(1);
});
