// insertData.js
const { MongoClient } = require('mongodb');

// Replace with your MongoDB connection string and database name
const connection_string = "mongodb+srv://seethinajayadileep:QjoJmVKafGhm6sX5@cluster0aisubjective.exfolpt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0aisubjective";
const dbName = "examdb";

// Dummy data to insert into the assignments collection (without modelAnswer)
const assignments = [
  {
    "title": "Python Loops & Conditionals",
    "subject": "programming",
    "text": "Write a Python program that reads an integer n and prints all numbers from 1 to n, replacing multiples of 3 with 'Fizz', multiples of 5 with 'Buzz', and multiples of both with 'FizzBuzz'.",
    "maxMarks": 12,
    "dueDate": "2025-11-05",
    "status": "pending",
    "submittedAnswer": null,
    "score": null,
    "feedback": null
  },
  {
    "title": "Time & Space Complexity (Short Answer)",
    "subject": "programming",
    "text": "Explain the difference between time complexity and space complexity with one example each. Then analyze the time complexity of binary search.",
    "maxMarks": 10,
    "dueDate": "2025-11-12",
    "status": "pending",
    "submittedAnswer": null,
    "score": null,
    "feedback": null
  },
  {
    "title": "Functions and Recursion in Python",
    "subject": "programming",
    "text": "Implement a recursive function to compute the nth Fibonacci number. Also provide an iterative version and compare their time complexities.",
    "maxMarks": 15,
    "dueDate": "2025-11-18",
    "status": "pending",
    "submittedAnswer": null,
    "score": null,
    "feedback": null
  },
  {
    "title": "Quadratic Equations",
    "subject": "mathematics",
    "text": "Solve the quadratic equation 2x^2 − 7x + 3 = 0. Show factorization or quadratic formula steps and verify your roots.",
    "maxMarks": 10,
    "dueDate": "2025-11-06",
    "status": "pending",
    "submittedAnswer": null,
    "score": null,
    "feedback": null
  },
  {
    "title": "Coordinate Geometry",
    "subject": "mathematics",
    "text": "Find the equation of the line passing through (2, −1) and (6, 7). Then compute the distance from the point (4, 3) to this line.",
    "maxMarks": 12,
    "dueDate": "2025-11-14",
    "status": "pending",
    "submittedAnswer": null,
    "score": null,
    "feedback": null
  },
  {
    "title": "Sequences and Series",
    "subject": "mathematics",
    "text": "Given an arithmetic progression with first term a1 = 5 and common difference d = 3, find the 20th term and the sum of the first 20 terms.",
    "maxMarks": 8,
    "dueDate": "2025-11-20",
    "status": "pending",
    "submittedAnswer": null,
    "score": null,
    "feedback": null
  },
  {
    "title": "States of Matter",
    "subject": "science",
    "text": "Explain the molecular differences between solids, liquids, and gases. Provide one everyday example of a change of state and the energy exchange involved.",
    "maxMarks": 12,
    "dueDate": "2025-11-07",
    "status": "pending",
    "submittedAnswer": null,
    "score": null,
    "feedback": null
  },
  {
    "title": "Human Digestive System",
    "subject": "science",
    "text": "Describe the path of food through the human digestive system and explain the role of enzymes in digestion.",
    "maxMarks": 15,
    "dueDate": "2025-11-16",
    "status": "pending",
    "submittedAnswer": null,
    "score": null,
    "feedback": null
  },
  {
    "title": "Electric Circuits Basics",
    "subject": "science",
    "text": "Define voltage, current, and resistance. Using Ohm’s law, calculate the current through a 220Ω resistor connected to a 11V source.",
    "maxMarks": 10,
    "dueDate": "2025-11-22",
    "status": "pending",
    "submittedAnswer": null,
    "score": null,
    "feedback": null
  },
  {
    "title": "Industrial Revolution Impacts",
    "subject": "history",
    "text": "Discuss two major technological innovations of the Industrial Revolution and their social and economic impacts in 19th-century Europe.",
    "maxMarks": 15,
    "dueDate": "2025-11-08",
    "status": "pending",
    "submittedAnswer": null,
    "score": null,
    "feedback": null
  },
  {
    "title": "World War I Causes",
    "subject": "history",
    "text": "Explain how militarism, alliances, imperialism, and nationalism contributed to the outbreak of World War I.",
    "maxMarks": 12,
    "dueDate": "2025-11-15",
    "status": "pending",
    "submittedAnswer": null,
    "score": null,
    "feedback": null
  },
  {
    "title": "Indian National Movement (1905–1947)",
    "subject": "history",
    "text": "Outline the key phases of the Indian freedom struggle from the Swadeshi movement to Independence, highlighting one leader and one event per phase.",
    "maxMarks": 18,
    "dueDate": "2025-11-23",
    "status": "pending",
    "submittedAnswer": null,
    "score": null,
    "feedback": null
  },
  {
    "title": "Thesis Statements & Topic Sentences",
    "subject": "english",
    "text": "Write a clear thesis statement for an essay about the benefits and drawbacks of social media. Then write three topic sentences for body paragraphs supporting your thesis.",
    "maxMarks": 8,
    "dueDate": "2025-11-09",
    "status": "pending",
    "submittedAnswer": null,
    "score": null,
    "feedback": null
  },
  {
    "title": "Narrative Writing: Show, Don’t Tell",
    "subject": "english",
    "text": "Write a 150–200 word narrative paragraph that shows a character experiencing fear using imagery and sensory details. Avoid directly stating 'they were scared'.",
    "maxMarks": 10,
    "dueDate": "2025-11-17",
    "status": "pending",
    "submittedAnswer": null,
    "score": null,
    "feedback": null
  },
  {
    "title": "Formal vs Informal Tone",
    "subject": "english",
    "text": "Rewrite the given informal email into a formal email suitable for a teacher or employer. Clearly adjust greetings, vocabulary, and sign-off.",
    "maxMarks": 7,
    "dueDate": "2025-11-21",
    "status": "pending",
    "submittedAnswer": null,
    "score": null,
    "feedback": null
  }]

async function insertAssignments() {
    let client;
    try {
        client = await MongoClient.connect(connection_string);
        const db = client.db(dbName);
        const collection = db.collection('assignments');


        const result = await collection.insertMany(assignments);
        console.log(`✅ Successfully inserted ${result.insertedCount} documents.`);
    } catch (error) {
        console.error("❌ Failed to insert data:", error);
    } finally {
        if (client) {
            await client.close();
            console.log("Database connection closed.");
        }
    }
}

insertAssignments();