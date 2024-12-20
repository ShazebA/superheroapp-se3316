const express = require('express');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const mongoURI = 'mongodb+srv://sashiqu:sashiqu@superhero.i0fq1ho.mongodb.net/?retryWrites=true&w=majority';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true
    }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('passwordHash')) return next();

    this.passwordHash = await bcrypt.hash(this.passwordHash, 8);
    next();
});

userSchema.methods.checkPassword = async function(password) {
    return await bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model('Superhero', userSchema, "Users");

const router = express.Router();

const JWTsecret = "shazzy"; 
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));
  

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

        if (!user.isEmailVerified) {
            const verificationToken = jwt.sign({ userId: user._id }, JWTsecret, { expiresIn: '1h' });
            const baseUrl = process.env.BASE_URL || 'http://localhost:5000'; 
            const verificationLink = `${baseUrl}/api/verifyEmail?token=${verificationToken}`;

            return res.status(403).json({ 
                error: 'Email not verified', 
                verificationLink 
            });
        }

        const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, JWTsecret); 
        res.json({ token, isAdmin: user.isAdmin });
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

        const newUser = new User({ email, passwordHash: password, name });
        await newUser.save();

        const verificationToken = jwt.sign({ userId: newUser._id }, JWTsecret, { expiresIn: '1d' }); 

        const baseUrl = process.env.BASE_URL || 'http://localhost:5000'; 
        const verificationLink = `${baseUrl}/api/verifyEmail?token=${verificationToken}`;

        res.status(201).json({ message: "User registered successfully", verificationLink });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWTsecret); 
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

router.put('/api/updatePassword', verifyToken, async (req, res) => {
    const userId = req.user.userId; 
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


router.get('/api/verifyEmail', async (req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, JWTsecret);

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
