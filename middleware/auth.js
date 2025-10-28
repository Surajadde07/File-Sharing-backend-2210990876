const jwt = require("jsonwebtoken");

//! SURAJ SECTION
const isAuth = (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        console.log("=== AUTH DEBUG ===");
        console.log("authHeader:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("No valid auth header");
            return res.status(401).json({ msg: "No token, authorization denied" });
        }

        const token = authHeader.split(" ")[1];
        console.log("token:", token?.substring(0, 20) + "...");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("decoded:", decoded);

        // Handle both token structures for backward compatibility
        if (decoded.user) {
            // New structure: { user: { id, email, username } }
            req.user = decoded.user;
        } else if (decoded.id) {
            // Old structure: { id, email, username }
            req.user = {
                id: decoded.id,
                email: decoded.email,
                username: decoded.username
            };
        } else {
            throw new Error("Invalid token structure");
        }
        console.log("req.user set to:", req.user);

        next();
    } catch (err) {
        console.log("Auth error:", err.message);
        return res.status(401).json({ msg: "Token is not valid" });
    }
};

module.exports = isAuth;
