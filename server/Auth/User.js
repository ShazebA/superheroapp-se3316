const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

// Password hash middleware.
userSchema.pre('save', async function(next) {
    if (!this.isModified('passwordHash')) return next();

    this.passwordHash = await bcrypt.hash(this.passwordHash, 8);
    next();
});

// Helper method to check the password.
userSchema.methods.checkPassword = async function(password) {
    return await bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
