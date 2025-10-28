# Google OAuth Setup Instructions

## Step 1: Create Google Cloud Project and OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add these URLs:
     - **Authorized JavaScript origins**: `http://localhost:3000`, `http://localhost:5000`
     - **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback`
5. Copy the Client ID and Client Secret

## Step 2: Update Environment Variables

Update your `.env` file with the Google OAuth credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-google-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-here
SESSION_SECRET=your-random-session-secret-here
FRONTEND_URL=http://localhost:3000
```

## Step 3: Generate a Session Secret

You can generate a random session secret using Node.js:

```javascript
// Run this in Node.js console
require('crypto').randomBytes(64).toString('hex')
```

## Step 4: Test the Implementation

1. Start your backend server: `npm start`
2. Start your frontend server: `cd frontend && npm start`
3. Go to `http://localhost:3000/login`
4. Click "Sign in with Google"
5. Complete the Google OAuth flow
6. You should be redirected back to your app and logged in

## Team Contributions for Google OAuth:

### SURAJ & TEAM - Google Authentication System
- **Backend Setup**: Passport.js configuration, OAuth routes
- **Frontend Integration**: Google Sign-In button, auth callback handling
- **User Model Enhancement**: Added Google OAuth fields
- **API Integration**: Updated authentication API for Google OAuth

## Files Created/Modified:

### Backend:
- `config/passport.js` - Passport Google OAuth strategy
- `routes/authRoutes.js` - Google OAuth routes
- `models/userModel.js` - Enhanced user model for Google auth
- `server.js` - Added passport middleware

### Frontend:
- `components/GoogleSignInButton.js` - Reusable Google sign-in button
- `components/AuthCallback.js` - Handles Google OAuth callback
- `components/Login.js` - Added Google sign-in option
- `components/Register.js` - Added Google sign-up option
- `components/Navbar.js` - Shows user profile picture
- `services/api.js` - Added Google auth API calls
- `App.js` - Added auth callback route

## Security Notes:

1. **Environment Variables**: Never commit actual credentials to version control
2. **HTTPS in Production**: Use HTTPS for production deployment
3. **Secure Sessions**: Use secure session configuration in production
4. **CORS Configuration**: Properly configure CORS for production domains

## Troubleshooting:

1. **"redirect_uri_mismatch"**: Ensure the redirect URI in Google Console matches exactly
2. **"unauthorized_client"**: Check that the Client ID is correct
3. **Session issues**: Ensure session secret is set and consistent
4. **CORS errors**: Verify CORS configuration allows your frontend domain