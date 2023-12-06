const express = require('express');
const DMCARequest = require('./Schemas/DMCA'); // Adjust the path as necessary
const router = express.Router();
const mongoose = require('mongoose');



const mongoURI = 'mongodb+srv://sashiqu:sashiqu@superhero.i0fq1ho.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Create a new DMCA request
router.post('/dmca', async (req, res) => {
    try {
        const dmcaRequest = new DMCARequest(req.body);
        await dmcaRequest.save();
        res.status(201).json(dmcaRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
