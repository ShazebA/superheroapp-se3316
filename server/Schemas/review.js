const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    listName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1, // assuming a rating scale of 1-5
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    creationDate: {
        type: Date,
        default: Date.now
    }
});

const Review = mongoose.model('Review', reviewSchema , "reviews");
module.exports = Review;
