// index.js
require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5038;
const DBNAME = "examdb";
const connection_string = process.env.MONGO_URI;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let database;

const startServer = async () => {
    try {
        const client = await MongoClient.connect(connection_string);
        database = client.db(DBNAME);
        console.log("✅ MongoDB connected successfully");

        app.get("/assignments", async (req, res) => {
            try {
                const collection = database.collection("assignments");
                const items = await collection.find({}).toArray();
                res.status(200).json(items);
            } catch (error) {
                console.error("❌ Error fetching assignments:", error);
                res.status(500).json({
                    message: "Failed to retrieve assignments",
                    error: error.message
                });
            }
        });

        // UPDATED: PUT route to handle all possible updates
        app.put("/assignments/:id", async (req, res) => {
            const { id } = req.params;
            const updateData = req.body;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid assignment ID" });
            }

            try {
                const collection = database.collection("assignments");
                
                // Dynamically build the update document
                const updateDoc = {};
                if (updateData.questionTitle !== undefined) updateDoc.title = updateData.questionTitle;
                if (updateData.questionText !== undefined) updateDoc.text = updateData.questionText;
                if (updateData.maxMarks !== undefined) updateDoc.maxMarks = updateData.maxMarks;
                if (updateData.subject !== undefined) updateDoc.subject = updateData.subject;
                if (updateData.dueDate !== undefined) updateDoc.dueDate = updateData.dueDate;
                
                if (updateData.submittedAnswer !== undefined) {
                    updateDoc.submittedAnswer = updateData.submittedAnswer;
                    updateDoc.status = "submitted";
                }
                if (updateData.score !== undefined) {
                    updateDoc.score = updateData.score;
                    updateDoc.status = "graded";
                }
                if (updateData.feedback !== undefined) {
                    updateDoc.feedback = updateData.feedback;
                    updateDoc.status = "graded";
                }
        
                if (Object.keys(updateDoc).length === 0) {
                    return res.status(400).json({ message: "No fields to update." });
                }

                const result = await collection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updateDoc }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: "Assignment not found" });
                }

                res.status(200).json({ message: "Assignment updated successfully." });
            } catch (error) {
                console.error("❌ Error updating assignment:", error);
                res.status(500).json({
                    message: "Failed to update assignment",
                    error: error.message
                });
            }
        });
        
        app.post("/assignments/add", async (req, res) => {
            try {
                const collection = database.collection("assignments");
                const { questionTitle, questionText, maxMarks, subject, dueDate } = req.body;
                
                const newAssignment = {
                    title: questionTitle,
                    subject: subject,
                    text: questionText,
                    maxMarks: maxMarks,
                    dueDate: dueDate,
                    status: "pending",
                    submittedAnswer: null,
                    score: null,
                    feedback: null
                };

                const result = await collection.insertOne(newAssignment);
                
                res.status(201).json({ 
                    message: "Question uploaded successfully!", 
                    assignmentId: result.insertedId 
                });
            } catch (error) {
                console.error("❌ Error uploading new question:", error);
                res.status(500).json({
                    message: "Failed to upload question",
                    error: error.message
                });
            }
        });
        
        app.delete("/assignments/:id", async (req, res) => {
            const { id } = req.params;
        
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid assignment ID" });
            }
        
            try {
                const collection = database.collection("assignments");
                const result = await collection.deleteOne({ _id: new ObjectId(id) });
        
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: "Assignment not found" });
                }
        
                res.status(200).json({ message: "Question deleted successfully!" });
                
            } catch (error) {
                console.error("❌ Error deleting question:", error);
                res.status(500).json({
                    message: "Failed to delete question",
                    error: error.message
                });
            }
        });

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("❌ Failed to connect to MongoDB", error);
        process.exit(1);
    }
};

startServer();