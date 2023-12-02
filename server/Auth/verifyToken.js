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
