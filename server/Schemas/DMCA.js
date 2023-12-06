const mongoose = require('mongoose');

const dmcaRequestSchema = new mongoose.Schema({
    requestId: {
        type: String,
        required: true,
        unique: true
    },
    dateRequestReceived: {
        type: Date,
        required: true
    },
    dateNoticeSent: {
        type: Date,
        required: true
    },
    dateDisputeReceived: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Active', 'Processed'],
        default: 'Active'
    }
});

const DMCARequest = mongoose.model('DMCARequest', dmcaRequestSchema, "DMCARequests");

module.exports = DMCARequest;
