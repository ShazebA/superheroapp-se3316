const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Adjust the path as needed
const { body } = require('express-validator');


const router = express.Router();

const JWTsecret = 'your_jwt_secret'; // Replace 'your_jwt_secret' with your secret key

// Login endpoint
router.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !await user.checkPassword(password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: 'Account is deactivated' });
        }

        const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, 'your_jwt_secret'); // Replace 'your_jwt_secret' with your secret key
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/api/register', [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('name').not().isEmpty()
], async (req, res) => {
    const { email, password, name } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Create a new user
        const newUser = new User({ email, passwordHash: password, name });
        await newUser.save();

        // Generate a unique verification token
        const verificationToken = jwt.sign({ userId: newUser._id }, 'your_jwt_secret', { expiresIn: '1d' }); // Replace 'your_jwt_secret' with your secret key

        // Instead of sending an email, return the verification link
        const verificationLink = `http://localhost:5000/api/verifyEmail?token=${verificationToken}`; // Adjust the base URL as needed

        res.status(201).json({ message: "User registered successfully", verificationLink });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware to verify JWT token
const verifyToken = require('verifyToken.js'); // Implement this middleware

// Password update endpoint
router.put('/api/updatePassword', verifyToken, async (req, res) => {
    const userId = req.user.userId; // Assuming verifyToken adds user info to req
    const { newPassword } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.passwordHash = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Email verification endpoint
router.get('/api/verifyEmail', async (req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret'); // Replace 'your_jwt_secret' with your secret key
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.isEmailVerified = true;
        await user.save();

        res.json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
