const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Initialize the OAuth Client with your specific Client ID
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to generate your app's JWT (from authController.js)
const generateAppToken = (user) => {
    return jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '1d' }
    );
};

exports.googleLogin = async (req, res) => {
    const { token } = req.body; // This is the ID Token sent by the frontend

    try {
        // 1. Verify the ID token using Google's library
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name;

        // 2. Check if user exists (by email or Google ID)
        let user = await User.findOne({ $or: [{ email }, { googleId }] });

        if (!user) {
            // 3. Register: User does not exist, create a new user record
            user = new User({
                name: name,
                email: email,
                googleId: googleId,
                // passwordHash is omitted
            });
            await user.save();
        } else if (!user.googleId) {
            // 3b. Existing manual user links their Google account (optional link)
            user.googleId = googleId;
            await user.save();
        }
        
        // 4. Login: Generate our app-specific JWT
        const appToken = generateAppToken(user);

        res.status(200).json({ 
            token: appToken, 
            user: { id: user._id, name: user.name, email: user.email, role: user.role } 
        });

    } catch (error) {
        console.error("Google Auth Error:", error.message);
        res.status(401).json({ msg: 'Google token validation failed.' });
    }
};