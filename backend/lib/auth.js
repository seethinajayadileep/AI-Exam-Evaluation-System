const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "demo-dev-secret-change-in-production";
const TOKEN_TTL = "8h";

function signToken(user) {
    return jwt.sign(
        { sub: user._id.toString(), role: user.role, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: TOKEN_TTL }
    );
}

function publicUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
    };
}

async function hashPassword(plain) {
    return bcrypt.hash(plain, 10);
}

async function verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
}

function authenticate(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
        return res.status(401).json({ message: "Authentication required." });
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: payload.sub,
            role: payload.role,
            name: payload.name,
            email: payload.email
        };
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired session. Please log in again." });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "You do not have permission to perform this action." });
        }
        return next();
    };
}

module.exports = {
    signToken,
    publicUser,
    hashPassword,
    verifyPassword,
    authenticate,
    requireRole
};
