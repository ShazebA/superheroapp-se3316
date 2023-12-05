const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    items: [Number],
    isPublic: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        required: false
    },
    listOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    }
}, {
    timestamps: { updatedAt: 'lastModified' } // This will use 'lastModified' instead of 'updatedAt'
});

const List = mongoose.model('List', listSchema, "Lists");
module.exports = List;
