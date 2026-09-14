export const SUBJECTS = [
  { value: "programming", label: "Programming" },
  { value: "mathematics", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "english", label: "English" },
  { value: "history", label: "History" },
  { value: "geography", label: "Geography" }
];

export const DEMO_ACCOUNTS = {
  teacher: { email: "teacher@demo.school", password: "Demo@1234", name: "Dr. Maya Smith" },
  student: { email: "alex.johnson@demo.school", password: "Demo@1234", name: "Alex Johnson" }
};

export const SHOW_DEMO_LOGIN = process.env.REACT_APP_SHOW_DEMO_LOGIN !== "false";
