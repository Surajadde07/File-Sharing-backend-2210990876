const mongoose = require("mongoose");

const { Schema } = mongoose;

//! TANEY SECTION + GOOGLE AUTH ENHANCEMENT
const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function() { return !this.googleId; } }, // Password not required for Google users
    googleId: { type: String }, // Google OAuth ID
    profilePicture: { type: String }, // Profile picture URL from Google
    isVerified: { type: Boolean, default: false }, // Email verification status
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' }, // Track auth method
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);