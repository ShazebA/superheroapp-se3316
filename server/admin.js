const express = require('express');
const mongoose = require('mongoose');
const User = require('./Schemas/User'); // Adjust the path to your User model
const Review = require('./Schemas/Review'); // Adjust the path to your Review model
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

router.put('/revoke-admin/:userId', checkAdmin, async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isAdmin = false;
        await user.save();

        res.json({ message: 'Admin privileges revoked', user: { id: user._id, name: user.name, isAdmin: user.isAdmin } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/hide-review/:reviewId', checkAdmin, async (req, res) => {
    const reviewId = req.params.reviewId;

    try {
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        review.isVisible = false;
        await review.save();

        res.json({ message: 'Review hidden successfully', reviewId: review._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/unhide-review/:reviewId', checkAdmin, async (req, res) => {
    const reviewId = req.params.reviewId;

    try {
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        review.isVisible = true;
        await review.save();

        res.json({ message: 'Review visibility restored', reviewId: review._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/deactivate-user/:userId', checkAdmin, async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isActive = false;
        await user.save();

        res.json({ message: 'User account deactivated', userId: user._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/reactivate-user/:userId', checkAdmin, async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isActive = true;
        await user.save();

        res.json({ message: 'User account reactivated', userId: user._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/users', checkAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash'); // Exclude passwordHash for security
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to get all reviews
router.get('/reviews', checkAdmin, async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
