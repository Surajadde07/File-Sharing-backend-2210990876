const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

//! SURAJ & TEAM DID THIS CHANGE - Google OAuth Routes

// Check if Google OAuth is configured
const isGoogleOAuthConfigured = () => {
    return process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
};

// Route to start Google OAuth
router.get('/google', (req, res, next) => {
    if (!isGoogleOAuthConfigured()) {
        return res.status(503).json({ 
            error: 'Google OAuth is not configured. Please contact administrator.' 
        });
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google OAuth callback route
router.get('/google/callback', (req, res, next) => {
    if (!isGoogleOAuthConfigured()) {
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendURL}/login?error=oauth_not_configured`);
    }
    
    passport.authenticate('google', { session: false }, (err, user) => {
        if (err) {
            console.error('Error in Google callback:', err);
            const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(`${frontendURL}/login?error=auth_failed`);
        }
        
        if (!user) {
            const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(`${frontendURL}/login?error=auth_failed`);
        }
        
        try {
            // Generate JWT token for the user (matching structure with regular auth)
            const token = jwt.sign(
                { 
                    user: {
                        id: user._id,
                        email: user.email,
                        username: user.username
                    }
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Redirect to frontend with token
            const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
            res.redirect(`${frontendURL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture
            }))}`);
        } catch (error) {
            console.error('Error generating token:', error);
            const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
            res.redirect(`${frontendURL}/login?error=auth_failed`);
        }
    })(req, res, next);
});

// Route to check auth status
router.get('/status', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({
            success: true,
            user: {
                id: decoded.user.id,
                username: decoded.user.username,
                email: decoded.user.email
            }
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;