const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

//! SURAJ & TEAM DID THIS CHANGE - Google OAuth Integration
// Only configure Google Strategy if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('✅ Google OAuth Strategy configured successfully');
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists with this Google ID
            let existingUser = await User.findOne({ googleId: profile.id });
            
            if (existingUser) {
                return done(null, existingUser);
            }

            // Check if user exists with the same email
            existingUser = await User.findOne({ email: profile.emails[0].value });
            
            if (existingUser) {
                // Link Google account to existing user
                existingUser.googleId = profile.id;
                existingUser.authProvider = 'google';
                await existingUser.save();
                return done(null, existingUser);
            }

            // Create new user
            const newUser = new User({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                profilePicture: profile.photos[0].value,
                isVerified: true, // Google accounts are pre-verified
                authProvider: 'google'
            });

            await newUser.save();
            done(null, newUser);
        } catch (error) {
            console.error('Error in Google Strategy:', error);
            done(error, null);
        }
    }));
} else {
    console.log('❌ Google OAuth credentials not provided. Google authentication will be disabled.');
}

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;