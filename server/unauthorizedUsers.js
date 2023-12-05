const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const List = require('./Schemas/List'); // Import List model
const Review = require('./Schemas/Review'); // Import Review model
const { verifyToken } = require('./Auth/verifyToken');
const { MongoClient } = require('mongodb');
const User = require('./Auth/authRoute');

const router = express.Router();

const mongoURI = 'mongodb+srv://sashiqu:sashiqu@superhero.i0fq1ho.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

async function calculateAverageRating(listName) {
    const reviews = await Review.find({ listName });
    if (reviews.length === 0) return 0;
    
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (totalRating / reviews.length).toFixed(2); // Rounds to 2 decimal places
    }

router.get('/public-lists', async (req, res) => {
    try {
        const publicLists = await List.find({ isPublic: true })
        .sort({ lastModified: -1 })
        .limit(10)
        .populate({
            path: 'listOwner',
            select: 'name -_id', // Select only the 'name' field and exclude the '_id' field
        });
    
        // Using Promise.all to wait for all async operations to complete
        const listsWithDetails = await Promise.all(publicLists.map(async list => {
        const averageRating = await calculateAverageRating(list.name);
        return {
            id: list._id,
            name: list.name,
            creatorNickname: list.listOwner.name, // Using the 'name' field from the User document
            numberOfHeroes: list.items.length,
            averageRating: averageRating,
            lastModified: list.lastModified
        };
        }));
    
        res.json(listsWithDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/public-lists/:listId', async (req, res) => {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Connect to MongoDB
    async function connectToMongo() {
        try {
            await client.connect();
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Connection to MongoDB failed', error);
        }
    }


    connectToMongo();
    const listId = req.params.listId;

    try {
        // Fetch the specific public list
        const list = await List.findById(listId);
        if (!list || !list.isPublic) {
            return res.status(404).json({ error: "List not found or list is not public" });
        }

        // Fetch heroes details in the list
        const database = client.db('test');
        const superheroesCollection = database.collection('Superhero_collection');
        const powersCollection = database.collection('Superhero_power_collection');
        const heroesInList = await superheroesCollection.find({ id: { $in: list.items } }).toArray();

        for (let hero of heroesInList) {
            const powers = await powersCollection.findOne({ hero_names: hero.name });
            hero.powers = powers ? Object.keys(powers).filter(power => powers[power] === "True") : [];
        }

        client.close();

        const reviews = await Review.find({ listName });
        if (reviews.length === 0) return 0;



        // Construct the expanded list information
        const expandedListInfo = {
            id: list._id,
            name: list.name,
            creatorNickname: list.listOwner.name, 
            description: list.description,
            heroes: heroesInList, // Array of heroes details
            numberOfHeroes: list.items.length,
            reviews: reviews
            // Add any additional required information
        };

        res.json(expandedListInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/public-lists/check/:listId', async (req, res) => {
    const listId = req.params.listId;

    try {
        const list = await List.findOne({ _id: listId, isPublic: true });
        if (!list) {
            return res.status(404).json({ error: "List not found or is no longer public" });
        }

        res.json({ status: 'available', listId: listId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;