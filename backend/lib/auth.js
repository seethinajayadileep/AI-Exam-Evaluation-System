const crypto = require("crypto");

const DEMO_USERS = [
  {
    email: "teacher@demo.local",
    password: "demo123",
    role: "teacher",
    name: "Dr. Meera Iyer",
  },
  {
    email: "student@demo.local",
    password: "demo123",
    role: "student",
    name: "Alex Kumar",
  },
];

function secret() {
  return process.env.AUTH_SECRET || "dev-only-change-me";
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function publicUser(user) {
  return { email: user.email, role: user.role, name: user.name };
}

function login(email, password) {
  const user = DEMO_USERS.find(
    (item) => item.email.toLowerCase() === String(email || "").toLowerCase().trim() && item.password === password
  );
  if (!user) return null;
  const token = sign({
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  return { token, user: publicUser(user) };
}

function demoAccounts() {
  return DEMO_USERS.map((user) => ({
    email: user.email,
    password: user.password,
    role: user.role,
    name: user.name,
  }));
}

module.exports = { login, verify, demoAccounts, publicUser };
