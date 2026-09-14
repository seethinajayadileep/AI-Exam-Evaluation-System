# AI Exam Evaluation System

Web app for teachers to publish subjective questions with model answers and rubrics, and for students to submit long-form answers. Teachers can run AI evaluation, review confidence and criterion-level scores, then approve or override the grade. Students only see scores after a teacher publishes them.

## Live deployment

| Surface | URL |
| --- | --- |
| Frontend | https://ai-exam-evaluation-system.vercel.app/ |
| Backend API | https://eval.seethinajayadileep.dev |
| Health check | https://eval.seethinajayadileep.dev/api/health |

The Vercel app calls the backend at `https://eval.seethinajayadileep.dev`. Sign in with the demo accounts below.

## Demo accounts (fictional)

These are the only seeded users. Do not load real student data until you replace the demo login with your own identity provider.

| Role | Email | Password |
| --- | --- | --- |
| Teacher | teacher@demo.school | Demo@1234 |
| Student | alex.johnson@demo.school | Demo@1234 |
| Student | jordan.lee@demo.school | Demo@1234 |

Dashboards are blocked until you sign in. The API also requires a Bearer token and checks role on every write.

## Run locally

1. In `backend`, copy `.env.example` to `.env` and set `MONGO_URI`, `JWT_SECRET`, and `OPENAI_API_KEY`.
2. `cd backend && npm install && npm start`
3. `cd frontend && npm install && npm start`

The first backend start reseeds demo assignments if the seed version changed (unique questions, current due dates, no duplicate rows). To force a reset: `npm run seed` in `backend`.

## Main capabilities

- Email/password login with teacher and student roles
- Teacher: create questions with model answer + rubric, review submissions, Evaluate with AI, approve or override, audit trail
- Student: pending vs expired assignments, submit before the due date, view published feedback
- Programming is included in subject filters and the question form
