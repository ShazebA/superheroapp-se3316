const express = require('express');
const User = require('../Schemas/User'); // Adjust the path to your User model
const Review = require('../Schemas/review'); // Adjust the path to your Review model
const { verifyToken } = require('./Auth/verifyToken');


const router = express.Router();
router.use(verifyToken);

const mongoURI = 'mongodb+srv://sashiqu:sashiqu@superhero.i0fq1ho.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const checkAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};

router.put('/grant-admin/:userId', checkAdmin, async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isAdmin = true;
        await user.save();

        res.json({ message: 'Admin privileges granted', user: { id: user._id, name: user.name, isAdmin: user.isAdmin } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





module.exports = router;
