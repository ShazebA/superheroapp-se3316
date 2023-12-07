const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, param, query, validationResult } = require('express-validator');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const router = require('./Auth/authRoute.js'); 
const stringSimilarity = require('string-similarity');
require('dotenv').config();



const app = express();
const PORT = 5000;
const mongoURI = 'mongodb+srv://sashiqu:sashiqu@superhero.i0fq1ho.mongodb.net/?retryWrites=true&w=majority';

app.use(helmet());
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(express.json({ limit: '100kb' }));
app.use(cors());



const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100
});
app.use('/api/', apiLimiter);
app.set('trust proxy', 1);



const validate = validations => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({ errors: errors.array() });
    };
};

app.use(bodyParser.json({limit: '100kb'}));
app.use(bodyParser.urlencoded({ extended: true }));


app.use(router);
const authenticatedUsers = require('./authenticatedUsers');
app.use('/api/authenticated', authenticatedUsers);
const unauthorizedUsers = require('./unauthorizedUsers');
app.use('/api', unauthorizedUsers);
const adminRouter = require('./admin');
app.use('/api/admin', adminRouter);
const dmcaRouter = require('./DMCArouter');
app.use('/api', dmcaRouter);



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

app.get('/superhero/search', [
    query('name').optional().isLength({ max: 100 }),
    query('race').optional().isLength({ max: 50 }),
    query('publisher').optional().isLength({ max: 100 }),
    query('powers').optional().isLength({ max: 200 }),
    query('n').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const database = client.db('test');
        const superheroCollection = database.collection('Superhero_collection');
        const superheroPowerCollection = database.collection('Superhero_power_collection');

        const normalizeString = (str) => str.replace(/\s+/g, '').toLowerCase();

        
        let query = {};
        if (req.query.name) {
            const normalizedInputName = normalizeString(req.query.name);
            query.name = {
                $where: function() {
                    return stringSimilarity.compareTwoStrings(normalizeString(this.name), normalizedInputName) > 0.8;
                }
            };
        }
        if (req.query.race) {
            const normalizedInputRace = normalizeString(req.query.race);
            query.race = {
                $where: function() {
                    return stringSimilarity.compareTwoStrings(normalizeString(this.race), normalizedInputRace) > 0.8;
                }
            };
        }
        if (req.query.publisher) {
            const normalizedInputPublisher = normalizeString(req.query.publisher);
            query.publisher = {
                $where: function() {
                    return stringSimilarity.compareTwoStrings(normalizeString(this.publisher), normalizedInputPublisher) > 0.8;
                }
            };
        }

        let matchedHeroes = await superheroCollection.find(query).toArray();

        if (req.query.powers) {
            const powersQuery = req.query.powers.toLowerCase().split(',');
            matchedHeroes = await Promise.all(matchedHeroes.filter(async (hero) => {
                const heroPowersEntry = await superheroPowerCollection.findOne({ hero_names: hero.name });
        
                return heroPowersEntry && powersQuery.every(pq => heroPowersEntry[pq] === "True");
            }));
        }
        
        if (req.query.n) {
            matchedHeroes = matchedHeroes.slice(0, req.query.n);
        }

        matchedHeroes = await Promise.all(matchedHeroes.map(async (hero) => {
            const heroPowersEntry = await superheroPowerCollection.findOne({ hero_names: hero.name });
        
            hero.powers = heroPowersEntry ? Object.entries(heroPowersEntry)
                .filter(([key, value]) => key !== 'hero_names' && value === 'True') 
                .map(([key, _]) => key) : [];
            
            return hero;
        }));
        

        res.json(matchedHeroes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });

app.listen(PORT, () => {
    console.log(`Superhero app listening on port ${PORT}!`);
})

