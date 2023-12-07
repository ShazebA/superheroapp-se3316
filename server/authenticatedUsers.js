const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const List = require('./Schemas/List'); 
const Review = require('./Schemas/Review'); 
const { verifyToken } = require('./Auth/verifyToken');
const { MongoClient } = require('mongodb');
const Users = require('./Schemas/User');


const router = express.Router();
router.use(verifyToken);


const mongoURI = 'mongodb+srv://sashiqu:sashiqu@superhero.i0fq1ho.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

{router.post('/create-list', [
    body('name').not().isEmpty().trim().withMessage('Name is required'),
    body('description').optional().trim(),
    body('isPublic').isBoolean(),
    body('items').optional().isArray().withMessage('Items must be an array')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, description, isPublic, items } = req.body;
        const listOwner = req.user.userId; 

        const listCount = await List.countDocuments({ listOwner });
        if (listCount >= 20) {
            return res.status(400).json({ error: 'Maximum number of lists (20) reached' });
        }

        
        const existingList = await List.findOne({ name, listOwner });
        if (existingList) {
            return res.status(400).json({ error: 'A list with this name already exists' });
        }

        
        const newList = new List({
            name,
            items, 
            description,
            isPublic,
            listOwner
        });
        await newList.save();

        res.status(201).json(newList);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
}
    


router.get('/my-lists', async (req, res) => {
    try {
        const listOwner = req.user.userId; 

        
        const userLists = await List.find({ listOwner });

        res.status(200).json(userLists);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/edit-list/:listId', [
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('isPublic').optional().isBoolean(),
    body('items').optional().isArray().withMessage('Items must be an array')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const listId = req.params.listId;
        const { name, description, isPublic, items } = req.body;
        const listOwner = req.user.userId; 

        
        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        if (list.listOwner.toString() !== listOwner) {
            return res.status(403).json({ error: 'Not authorized to edit this list' });
        }

        
        if (name) list.name = name;
        if (description !== undefined) list.description = description;
        if (isPublic !== undefined) list.isPublic = isPublic;
        if (items !== undefined) list.items = items; 

        await list.save();
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});




router.delete('/delete-list/:listId', async (req, res) => {
    try {
        const listId = req.params.listId;
        const listOwner = req.user.userId; 

        
        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        if (list.listOwner.toString() !== listOwner) {
            return res.status(403).json({ error: 'Not authorized to delete this list' });
        }

        
        await list.remove();
        res.status(200).json({ message: 'List successfully deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});




router.post('/add-review', [
    body('listName').not().isEmpty().trim().withMessage('List name is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').not().isEmpty().trim().withMessage('Comment is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { listName, rating, comment } = req.body;
        const userId = req.user.userId; 

        const user = await Users.findById(userId).select('name');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        
        const review = new Review({
            listName,
            rating,
            comment,
            userName: user.name,
            creationDate: new Date() 
        });

        await review.save();
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/list-heroes/:listId', async (req, res) => {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

    
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
    const userId = req.user.userId; 

    try {
        
        const list = await List.findById(listId);
        if (!list || !list.listOwner.equals(userId)) {
            return res.status(404).json({ error: "List not found or you do not have permission" });
        }

        const database = client.db('test');
        const superheroesCollection = database.collection('Superhero_collection');
        const powersCollection = database.collection('Superhero_power_collection');


        
        const heroesInList = await superheroesCollection.find({ id: { $in: list.items } }).toArray();

        
        for (let hero of heroesInList) {
            const powers = await powersCollection.findOne({ hero_names: hero.name });
            hero.powers = powers ? Object.keys(powers).filter(power => powers[power] === "True") : [];
        }

        res.json(heroesInList);
        client.close();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;