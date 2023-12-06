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



const app = express();
const PORT = 5000;
const mongoURI = 'mongodb+srv://sashiqu:sashiqu@superhero.i0fq1ho.mongodb.net/?retryWrites=true&w=majority';

app.use(helmet());
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(express.json({ limit: '100kb' }));
app.use(cors());



const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
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


app.get('/superheroID/:id',  validate([
    param('id').isInt({ gt: 0 })
    ]), async (req, res) => {
    // Read the superhero_info.json file
    try {
        const database = client.db('test');
        const superheroes = database.collection('Superhero_collection');
        
        const heroId = parseInt(req.params.id);
        const hero = await superheroes.findOne({ id: heroId });

        if (!hero) {
            return res.status(404).json({ error: "Superhero not found" });
        }
        
        res.json(hero);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/superheroPow/:id/powers', [
    param('id').isInt({ gt: 0 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const database = client.db('test');
        const superheroCollection = database.collection('Superhero_collection');
        const superheroPowerCollection = database.collection('Superhero_power_collection');
        
        const heroId = parseInt(req.params.id);
        // Find the superhero by ID
        const hero = await superheroCollection.findOne({ id: heroId });

        if (!hero) {
            return res.status(404).json({ error: "Superhero not found" });
        }

        // Find the powers entry for the given superhero
        const powers = await superheroPowerCollection.findOne({ hero_names: hero.name });
        
        if (!powers) {
            return res.status(404).json({ error: "Powers not found for the superhero" });
        }
        
        // Extract the powers that are marked as true
        const truePowers = Object.entries(powers)
            .filter(([key, value]) => key !== 'hero_names' && value === true)
            .map(([key, _]) => key);

        // Return the hero's name and the true powers
        return res.json({
            name: hero.name,
            powers: truePowers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


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
        
        // Build the query for MongoDB
        let query = {};
        if (req.query.name) {
            query.name = { $regex: req.query.name, $options: 'i' }; // 'i' for case-insensitive
        }
        if (req.query.race) {
            query.Race = { $regex: req.query.race, $options: 'i' };
        }
        if (req.query.publisher) {
            query.Publisher = { $regex: req.query.publisher, $options: 'i' };
        }

        // Find the superheroes based on the query
        let matchedHeroes = await superheroCollection.find(query).toArray();

        // If powers are part of the search criteria, filter the results
        if (req.query.powers) {
            const powersQuery = req.query.powers.toLowerCase().split(',');
            matchedHeroes = await Promise.all(matchedHeroes.filter(async (hero) => {
                const heroPowersEntry = await superheroPowerCollection.findOne({ hero_names: hero.name });
        
                // Check if each power in the powersQuery array is set to true in the hero's power data
                return heroPowersEntry && powersQuery.every(pq => heroPowersEntry[pq] === "True");
            }));
        }
        

        // Sort the results if sort criteria is provided
        if (req.query.sort) {
            const sortCriteria = req.query.sort.toLowerCase();
            matchedHeroes.sort((a, b) => {
                switch (sortCriteria) {
                    case 'name':
                    case 'race':
                    case 'publisher':
                        return a[sortCriteria].localeCompare(b[sortCriteria]);
                    case 'powers':
                        return b.powers.length - a.powers.length;
                    default:
                        console.log("Invalid sort criteria provided");
                        return 0;
                }
            });
        }

        // Limit the results if 'n' is specified
        if (req.query.n) {
            matchedHeroes = matchedHeroes.slice(0, req.query.n);
        }

        // Map through heroes to append their powers
        matchedHeroes = await Promise.all(matchedHeroes.map(async (hero) => {
            const heroPowersEntry = await superheroPowerCollection.findOne({ hero_names: hero.name });
        
            // Append only powers that are set to true
            hero.powers = heroPowersEntry ? Object.entries(heroPowersEntry)
                .filter(([key, value]) => key !== 'hero_names' && value === 'True') // Only include powers where the value is true
                .map(([key, _]) => key) : [];
            
            return hero;
        }));
        

        // Return the search results
        res.json(matchedHeroes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/publishers', async (req, res) => {
    try {
        const database = client.db('test');
        const superheroCollection = database.collection('Superhero_collection');
        
        // Use MongoDB's distinct function to get all unique publishers
        const publishers = await superheroCollection.distinct('Publisher');
        
        // Send the list of publishers as a JSON response
        res.json(publishers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/list', [
    body('name').isLength({ min: 1, max: 50 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const { name } = req.body;

    try {
        const database = client.db('test');
        const listsCollection = database.collection('Lists_collection'); // Replace with your actual collection name

        // Check if the list name already exists
        const listExists = await listsCollection.findOne({ name: name });
        if (listExists) {
            return res.status(400).json({ error: "List name already exists" });
        }

        // Create a new list if it does not exist
        await listsCollection.insertOne({ name: name, items: [] });

        res.json({ message: "List created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/lists', async (req, res) => {
    try {
        const database = client.db('test');
        const listsCollection = database.collection('Lists_collection');

        // Use MongoDB's distinct function to get all unique list names
        const listNames = await listsCollection.distinct('name');
        
        res.json(listNames);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.put('/list/:name', async (req, res) => {
    const { name } = req.params;
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "IDs should be provided as an array" });
    }

    // Convert the IDs from strings to numbers if they are not already
    const idNumbers = ids.map(id => typeof id === 'number' ? id : Number(id));

    try {
        const database = client.db('test');
        const listsCollection = database.collection('Lists_collection');

        // Check if the list name exists
        const list = await listsCollection.findOne({ name: name });
        if (!list) {
            return res.status(404).json({ error: "List name does not exist" });
        }

        // Update the list with the new IDs
        await listsCollection.updateOne(
            { name: name },
            { $set: { items: idNumbers } }
        );

        res.json({ message: "List updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




// app.get('/list/:name', (req, res) => {
//     const { name } = req.params;

//     const lists = JSON.parse(fs.readFileSync('listsDatabase.json', 'utf-8'));
//     if (!lists[name]) {
//         return res.status(404).json({ error: "List name does not exist" });
//     }

//     res.json(lists[name]);
// });

app.delete('/list/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const database = client.db('test');
        const listsCollection = database.collection('Lists_collection');

        // Check if the list exists before attempting to delete
        const list = await listsCollection.findOne({ name: name });
        if (!list) {
            return res.status(404).json({ error: "List name does not exist" });
        }

        // Delete the list
        await listsCollection.deleteOne({ name: name });

        res.json({ message: "List deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/list/details/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const database = client.db('test');
        const listsCollection = database.collection('Lists_collection');
        const superheroesCollection = database.collection('Superhero_collection');
        const powersCollection = database.collection('Superhero_power_collection');

        // Get the list
        const list = await listsCollection.findOne({ name: name });
        if (!list) {
            return res.status(404).json({ error: "List name does not exist" });
        }

        // Get the superheroes in the list
        const heroesInList = await superheroesCollection.find({ id: { $in: list.items } }).toArray();
        
        // Add powers to the heroes
        for (let hero of heroesInList) {
            const powers = await powersCollection.findOne({ hero_names: hero.name });
            hero.powers = powers ? Object.keys(powers).filter(power => powers[power] === "True") : [];
        }

        res.json(heroesInList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/list/ids/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const database = client.db('test');
        const listsCollection = database.collection('Lists_collection');

        // Get the list
        const list = await listsCollection.findOne({ name: name });
        if (!list) {
            return res.status(404).json({ error: "List name does not exist" });
        }

        res.json(list.items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/express_backend', (req, res) => { // Line 9
    res.json({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' }); // Line 10
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });

app.listen(PORT, () => {
    console.log(`Superhero app listening on port ${PORT}!`);
})

