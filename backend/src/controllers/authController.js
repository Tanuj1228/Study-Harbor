const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Helper function to generate JWT ---
const generateToken = (user) => {
    return jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '1d' } // Expires in 1 day by default
    );
};

// --- Register User ---
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // 1. Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // 2. Create new user instance
        user = new User({
            name,
            email,
            // Default role is 'user' (set in User model)
        });

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(password, salt);

        // 4. Save user to database
        await user.save();

        // 5. Generate and send token (Auto-login after register)
        const token = generateToken(user);

        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during registration');
    }
};

// --- Login User ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 3. Generate and send token
        const token = generateToken(user);

        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during login');
    }
};