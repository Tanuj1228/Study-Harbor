const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateAppToken = (user) => {
    return jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '1d' }
    );
};

exports.googleLogin = async (req, res) => {
    const { token } = req.body; 

    try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name;

        let user = await User.findOne({ $or: [{ email }, { googleId }] });

        if (!user) {
            user = new User({
                name: name,
                email: email,
                googleId: googleId,
            });
            await user.save();
        } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }
        
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