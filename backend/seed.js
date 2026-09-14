const { MongoClient } = require("mongodb");
const { hashPassword } = require("./lib/auth");

const SEED_VERSION = 3;
const DEMO_PASSWORD = "Demo@1234";

function daysFromToday(offset) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
}

function isoDaysAgo(offset, hour = 15) {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    return date.toISOString();
}

function buildAssignments(teacherId) {
    return [
        {
            title: "Python Loops & Conditionals",
            subject: "programming",
            text: "Write a Python program that reads an integer n and prints all numbers from 1 to n, replacing multiples of 3 with 'Fizz', multiples of 5 with 'Buzz', and multiples of both with 'FizzBuzz'.",
            modelAnswer: "Read n, then loop i from 1 to n. If i is divisible by both 3 and 5 print FizzBuzz; else if divisible by 3 print Fizz; else if divisible by 5 print Buzz; else print i. Time complexity is O(n).",
            rubric: [
                { criterion: "Correct FizzBuzz logic", maxMarks: 6, description: "Handles 3, 5, and both cases in the right order." },
                { criterion: "Loop and input handling", maxMarks: 4, description: "Reads n and iterates 1..n." },
                { criterion: "Clarity", maxMarks: 2, description: "Readable code or clear explanation." }
            ],
            maxMarks: 12,
            dueDate: daysFromToday(14),
            createdAt: isoDaysAgo(20),
            createdBy: teacherId,
            status: "open"
        },
        {
            title: "Time & Space Complexity",
            subject: "programming",
            text: "Explain the difference between time complexity and space complexity with one example each. Then analyze the time complexity of binary search.",
            modelAnswer: "Time complexity describes how runtime grows with input size; space complexity describes extra memory. Example: bubble sort is O(n^2) time; a copy of an array uses O(n) extra space. Binary search halves the search space each step, so it is O(log n) time and O(1) extra space.",
            rubric: [
                { criterion: "Definitions", maxMarks: 4, description: "Clear distinction between time and space." },
                { criterion: "Examples", maxMarks: 3, description: "One valid example for each." },
                { criterion: "Binary search analysis", maxMarks: 3, description: "States O(log n) with reasoning." }
            ],
            maxMarks: 10,
            dueDate: daysFromToday(7),
            createdAt: isoDaysAgo(18),
            createdBy: teacherId,
            status: "open"
        },
        {
            title: "Quadratic Equations",
            subject: "mathematics",
            text: "Solve the quadratic equation 2x^2 − 7x + 3 = 0. Show factorization or quadratic formula steps and verify your roots.",
            modelAnswer: "2x^2 - 7x + 3 = (2x - 1)(x - 3) = 0, so x = 1/2 or x = 3. Verification: 2*(1/2)^2 - 7*(1/2) + 3 = 0.5 - 3.5 + 3 = 0; 2*9 - 21 + 3 = 0.",
            rubric: [
                { criterion: "Correct roots", maxMarks: 5, description: "x = 1/2 and x = 3." },
                { criterion: "Method shown", maxMarks: 3, description: "Factorization or quadratic formula." },
                { criterion: "Verification", maxMarks: 2, description: "Substitutes roots back into the equation." }
            ],
            maxMarks: 10,
            dueDate: daysFromToday(10),
            createdAt: isoDaysAgo(16),
            createdBy: teacherId,
            status: "open"
        },
        {
            title: "States of Matter",
            subject: "science",
            text: "Explain the molecular differences between solids, liquids, and gases. Provide one everyday example of a change of state and the energy exchange involved.",
            modelAnswer: "Solids have tightly packed particles with fixed shape; liquids have weaker forces and take the container shape; gases have large particle spacing and fill available volume. Melting ice is a solid-to-liquid change that absorbs heat (endothermic).",
            rubric: [
                { criterion: "Particle model", maxMarks: 6, description: "Compares arrangement, motion, and forces." },
                { criterion: "Change of state example", maxMarks: 4, description: "Names a real example and energy direction." },
                { criterion: "Everyday relevance", maxMarks: 2, description: "Clear, accurate everyday connection." }
            ],
            maxMarks: 12,
            dueDate: daysFromToday(17),
            createdAt: isoDaysAgo(15),
            createdBy: teacherId,
            status: "open"
        },
        {
            title: "Thesis Statements & Topic Sentences",
            subject: "english",
            text: "Write a clear thesis statement for an essay about the benefits and drawbacks of social media. Then write three topic sentences for body paragraphs supporting your thesis.",
            modelAnswer: "Thesis: Social media connects people and spreads information quickly, but it also encourages comparison and misinformation, so users need deliberate habits. Topic sentences could cover connection/community, mental-health costs, and strategies for healthier use.",
            rubric: [
                { criterion: "Thesis quality", maxMarks: 4, description: "Takes a clear, arguable position." },
                { criterion: "Topic sentences", maxMarks: 3, description: "Three sentences that support the thesis." },
                { criterion: "Tone and focus", maxMarks: 1, description: "Formal, specific language." }
            ],
            maxMarks: 8,
            dueDate: daysFromToday(28),
            createdAt: isoDaysAgo(12),
            createdBy: teacherId,
            status: "open"
        },
        {
            title: "Functions and Recursion in Python",
            subject: "programming",
            text: "Implement a recursive function to compute the nth Fibonacci number. Also provide an iterative version and compare their time complexities.",
            modelAnswer: "Recursive fib(n) calls fib(n-1)+fib(n-2) with base cases 0/1, which is exponential time. An iterative loop storing two previous values is O(n) time and O(1) extra space. Memoization reduces recursion to O(n).",
            rubric: [
                { criterion: "Recursive solution", maxMarks: 6, description: "Correct base cases and recursive step." },
                { criterion: "Iterative solution", maxMarks: 5, description: "Loop-based Fibonacci." },
                { criterion: "Complexity comparison", maxMarks: 4, description: "Exponential vs linear." }
            ],
            maxMarks: 15,
            dueDate: daysFromToday(-20),
            createdAt: isoDaysAgo(40),
            createdBy: teacherId,
            status: "open"
        },
        {
            title: "Human Digestive System",
            subject: "science",
            text: "Describe the path of food through the human digestive system and explain the role of enzymes in digestion.",
            modelAnswer: "Food travels mouth → esophagus → stomach → small intestine → large intestine. Enzymes such as amylase, pepsin, and lipase chemically break macromolecules into absorbable units, mainly in the small intestine with pancreatic juices.",
            rubric: [
                { criterion: "Pathway", maxMarks: 8, description: "Correct sequence of organs." },
                { criterion: "Enzyme roles", maxMarks: 7, description: "Explains chemical digestion with examples." }
            ],
            maxMarks: 15,
            dueDate: daysFromToday(12),
            createdAt: isoDaysAgo(14),
            createdBy: teacherId,
            status: "open"
        },
        {
            title: "World War I Causes",
            subject: "history",
            text: "Explain how militarism, alliances, imperialism, and nationalism contributed to the outbreak of World War I.",
            modelAnswer: "Militarism produced arms races; alliances turned a regional crisis into a general war; imperialism created rival claims; nationalism fueled unrest in the Balkans. The assassination of Franz Ferdinand triggered alliance obligations that mobilized Europe.",
            rubric: [
                { criterion: "Four MAIN causes", maxMarks: 8, description: "Covers militarism, alliances, imperialism, nationalism." },
                { criterion: "Trigger and connection", maxMarks: 4, description: "Links the 1914 crisis to those long-term causes." }
            ],
            maxMarks: 12,
            dueDate: daysFromToday(-7),
            createdAt: isoDaysAgo(30),
            createdBy: teacherId,
            status: "open"
        },
        {
            title: "Narrative Writing: Show, Don’t Tell",
            subject: "english",
            text: "Write a 150–200 word narrative paragraph that shows a character experiencing fear using imagery and sensory details. Avoid directly stating 'they were scared'.",
            modelAnswer: "A strong response uses sensory detail (heartbeat, cold hands, sound, light) and action rather than naming the emotion. It stays in scene, uses concrete verbs, and implies fear through behavior.",
            rubric: [
                { criterion: "Show don't tell", maxMarks: 5, description: "Implies fear without naming it." },
                { criterion: "Imagery", maxMarks: 3, description: "Specific sensory details." },
                { criterion: "Length and control", maxMarks: 2, description: "Approximately 150–200 words, coherent scene." }
            ],
            maxMarks: 10,
            dueDate: daysFromToday(-4),
            createdAt: isoDaysAgo(25),
            createdBy: teacherId,
            status: "open"
        },
        {
            title: "Electric Circuits Basics",
            subject: "science",
            text: "Define voltage, current, and resistance. Using Ohm’s law, calculate the current through a 220Ω resistor connected to a 11V source.",
            modelAnswer: "Voltage is electric potential difference, current is flow of charge, resistance opposes that flow. Ohm’s law: I = V/R = 11/220 = 0.05 A.",
            rubric: [
                { criterion: "Definitions", maxMarks: 6, description: "Accurate definitions of V, I, and R." },
                { criterion: "Calculation", maxMarks: 4, description: "I = 0.05 A with working." }
            ],
            maxMarks: 10,
            dueDate: daysFromToday(20),
            createdAt: isoDaysAgo(10),
            createdBy: teacherId,
            status: "open"
        },
        {
            title: "Coordinate Geometry",
            subject: "mathematics",
            text: "Find the equation of the line passing through (2, −1) and (6, 7). Then compute the distance from the point (4, 3) to this line.",
            modelAnswer: "Slope m = (7 - (-1))/(6 - 2) = 2. Point-slope: y + 1 = 2(x - 2) → y = 2x - 5, or 2x - y - 5 = 0. Distance from (4,3): |8 - 3 - 5|/sqrt(4+1) = 0.",
            rubric: [
                { criterion: "Line equation", maxMarks: 6, description: "Correct slope and equation." },
                { criterion: "Distance", maxMarks: 6, description: "Applies point-to-line formula correctly." }
            ],
            maxMarks: 12,
            dueDate: daysFromToday(6),
            createdAt: isoDaysAgo(9),
            createdBy: teacherId,
            status: "open"
        }
    ];
}

function buildSubmissions(assignmentsByTitle, alexId, jordanId) {
    const digest = assignmentsByTitle["Human Digestive System"];
    const ww1 = assignmentsByTitle["World War I Causes"];
    const narrative = assignmentsByTitle["Narrative Writing: Show, Don’t Tell"];
    const circuits = assignmentsByTitle["Electric Circuits Basics"];
    const geometry = assignmentsByTitle["Coordinate Geometry"];

    return [
        {
            assignmentId: digest._id,
            studentId: alexId,
            studentName: "Alex Johnson",
            submittedAnswer: "Food goes from the mouth to the esophagus, then the stomach, small intestine, and large intestine. Saliva starts starch digestion. Pepsin works in the stomach on proteins. The small intestine is where most absorption happens with help from pancreatic enzymes.",
            submittedAt: isoDaysAgo(2, 11),
            status: "submitted",
            score: null,
            feedback: null,
            aiEvaluation: null,
            gradedAt: null,
            gradedBy: null,
            evaluationLog: [
                { action: "submitted", actorId: alexId, actorName: "Alex Johnson", timestamp: isoDaysAgo(2, 11), details: {} }
            ]
        },
        {
            assignmentId: ww1._id,
            studentId: alexId,
            studentName: "Alex Johnson",
            submittedAnswer: "Militarism meant countries built large armies and navies. Alliances such as the Triple Entente and Triple Alliance pulled more nations into a local conflict. Imperialism created competition for colonies. Nationalism made groups want independence, especially in the Balkans. The assassination of Archduke Franz Ferdinand set the alliances in motion.",
            submittedAt: isoDaysAgo(18, 10),
            status: "graded",
            score: 10,
            feedback: "Strong coverage of the MAIN causes and the 1914 trigger. To reach full marks, connect how alliance obligations made a general war more likely once Austria-Hungary issued its ultimatum.",
            aiEvaluation: {
                score: 10,
                confidence: 0.86,
                criteria: [
                    { criterion: "Four MAIN causes", score: 7, maxMarks: 8, comment: "All four causes are present with brief examples." },
                    { criterion: "Trigger and connection", score: 3, maxMarks: 4, comment: "Mentions the assassination; alliance mechanism could be fuller." }
                ],
                feedback: "Accurate overview of long-term causes and the assassination trigger.",
                strengths: ["Covers militarism, alliances, imperialism, and nationalism."],
                improvements: ["Explain how alliance commitments converted a Balkan crisis into a European war."]
            },
            gradedAt: isoDaysAgo(16, 14),
            gradedBy: "teacher",
            evaluationLog: [
                { action: "submitted", actorId: alexId, actorName: "Alex Johnson", timestamp: isoDaysAgo(18, 10), details: {} },
                { action: "ai_evaluate", actorId: "system", actorName: "AI Evaluator", timestamp: isoDaysAgo(16, 13), details: { score: 10, confidence: 0.86 } },
                { action: "approve", actorId: "teacher", actorName: "Dr. Maya Smith", timestamp: isoDaysAgo(16, 14), details: { score: 10 } }
            ]
        },
        {
            assignmentId: narrative._id,
            studentId: alexId,
            studentName: "Alex Johnson",
            submittedAnswer: "The hallway light stuttered. Maya pressed her palm to the door until the wood grain bit her skin. Somewhere below, a pipe ticked. She counted the ticks, then lost them when a floorboard answered her own weight. Her breath stayed high in her chest. She waited for the next sound and did not switch on the lamp.",
            submittedAt: isoDaysAgo(12, 16),
            status: "graded",
            score: 9,
            feedback: "Vivid sensory detail and implied fear without naming it. Slightly short of the requested length, but the scene is controlled and specific.",
            aiEvaluation: {
                score: 9,
                confidence: 0.91,
                criteria: [
                    { criterion: "Show don't tell", score: 5, maxMarks: 5, comment: "Fear is shown through body and setting." },
                    { criterion: "Imagery", score: 3, maxMarks: 3, comment: "Sound, touch, and light are concrete." },
                    { criterion: "Length and control", score: 1, maxMarks: 2, comment: "Shorter than 150 words." }
                ],
                feedback: "Strong show-don't-tell scene with precise sensory detail.",
                strengths: ["Implies emotion through action."],
                improvements: ["Expand toward 150–200 words."]
            },
            gradedAt: isoDaysAgo(11, 9),
            gradedBy: "teacher",
            evaluationLog: [
                { action: "submitted", actorId: alexId, actorName: "Alex Johnson", timestamp: isoDaysAgo(12, 16), details: {} },
                { action: "teacher_grade", actorId: "teacher", actorName: "Dr. Maya Smith", timestamp: isoDaysAgo(11, 9), details: { score: 9 } }
            ]
        },
        {
            assignmentId: circuits._id,
            studentId: alexId,
            studentName: "Alex Johnson",
            submittedAnswer: "Voltage is the potential difference that pushes charge. Current is the flow of charge. Resistance is how much a component opposes current. Ohm’s law is I = V/R, so I = 11 / 220 = 0.05 A.",
            submittedAt: isoDaysAgo(1, 17),
            status: "pending_review",
            score: 9,
            feedback: "Clear definitions and a correct Ohm’s law calculation (0.05 A). Mention units throughout for a perfect score.",
            aiEvaluation: {
                score: 9,
                confidence: 0.88,
                criteria: [
                    { criterion: "Definitions", score: 5, maxMarks: 6, comment: "Accurate, slightly brief." },
                    { criterion: "Calculation", score: 4, maxMarks: 4, comment: "Correct current of 0.05 A." }
                ],
                feedback: "Correct calculation with solid definitions. Awaiting teacher approval.",
                strengths: ["Correct I = V/R working."],
                improvements: ["Include units with every quantity."]
            },
            gradedAt: null,
            gradedBy: null,
            evaluationLog: [
                { action: "submitted", actorId: alexId, actorName: "Alex Johnson", timestamp: isoDaysAgo(1, 17), details: {} },
                { action: "ai_evaluate", actorId: "system", actorName: "AI Evaluator", timestamp: isoDaysAgo(1, 18), details: { score: 9, confidence: 0.88 } }
            ]
        },
        {
            assignmentId: geometry._id,
            studentId: jordanId,
            studentName: "Jordan Lee",
            submittedAnswer: "Slope = (7 - (-1))/(6 - 2) = 8/4 = 2. Equation: y + 1 = 2(x - 2), so y = 2x - 5. Distance from (4, 3): |2*4 - 3 - 5| / sqrt(4+1) = 0 / sqrt(5) = 0. The point lies on the line.",
            submittedAt: isoDaysAgo(3, 13),
            status: "submitted",
            score: null,
            feedback: null,
            aiEvaluation: null,
            gradedAt: null,
            gradedBy: null,
            evaluationLog: [
                { action: "submitted", actorId: jordanId, actorName: "Jordan Lee", timestamp: isoDaysAgo(3, 13), details: {} }
            ]
        }
    ];
}

async function seedDemoData(database) {
    const users = database.collection("users");
    const assignments = database.collection("assignments");
    const submissions = database.collection("submissions");
    const meta = database.collection("meta");

    await users.deleteMany({});
    await assignments.deleteMany({});
    await submissions.deleteMany({});

    const passwordHash = await hashPassword(DEMO_PASSWORD);
    const userDocs = [
        { name: "Dr. Maya Smith", email: "teacher@demo.school", passwordHash, role: "teacher" },
        { name: "Alex Johnson", email: "alex.johnson@demo.school", passwordHash, role: "student" },
        { name: "Jordan Lee", email: "jordan.lee@demo.school", passwordHash, role: "student" }
    ];
    const insertedUsers = await users.insertMany(userDocs);
    const ids = Object.values(insertedUsers.insertedIds);
    const teacherId = ids[0];
    const alexId = ids[1];
    const jordanId = ids[2];

    const assignmentDocs = buildAssignments(teacherId);
    await assignments.insertMany(assignmentDocs);
    const created = await assignments.find({}).toArray();
    const byTitle = {};
    created.forEach((item) => {
        byTitle[item.title] = item;
    });

    await submissions.insertMany(buildSubmissions(byTitle, alexId, jordanId));
    await meta.updateOne(
        { _id: "seed" },
        { $set: { version: SEED_VERSION, seededAt: new Date().toISOString() } },
        { upsert: true }
    );

    return {
        users: userDocs.length,
        assignments: assignmentDocs.length,
        submissions: 5,
        version: SEED_VERSION
    };
}

async function ensureSeed(database) {
    const meta = database.collection("meta");
    const record = await meta.findOne({ _id: "seed" });
    if (record?.version === SEED_VERSION) {
        return { seeded: false, version: SEED_VERSION };
    }
    const result = await seedDemoData(database);
    return { seeded: true, ...result };
}

async function runCli() {
    require("dotenv").config();
    const uri = process.env.MONGO_URI;
    const client = await MongoClient.connect(uri);
    try {
        const result = await seedDemoData(client.db("examdb"));
        console.log("✅ Demo data reseeded:", result);
        console.log("Demo logins: teacher@demo.school / Demo@1234 and alex.johnson@demo.school / Demo@1234");
    } finally {
        await client.close();
    }
}

if (require.main === module) {
    runCli().catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    });
}

module.exports = { seedDemoData, ensureSeed, SEED_VERSION, DEMO_PASSWORD };
