const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

const clientFolderPath = path.join(__dirname, '..', 'client');
app.use(express.static("C:/University/Year 3/SE3316/se3316-sashiqu-lab3/client"));
app.use(bodyParser.json());

app.get('/', (req, res) => { 
    res.sendFile("C:/University/Year 3/SE3316/se3316-sashiqu-lab3/client/index.html");
});


app.get('/superheroID/:id', (req, res) => {
    // Read the superhero_info.json file
    const superheroes = JSON.parse(fs.readFileSync('superhero_info.json', 'utf-8'));

    // Find the superhero by ID
    const hero = superheroes.find(h => h.id === parseInt(req.params.id));
    
    if (!hero) {
        return res.status(404).json({ error: "Superhero not found" });
    }
    
    return res.json(hero);
});

app.get('/superheroPow/:id/powers', (req, res) => {
    // Read the superhero_info.json file to get the superhero's name by ID
    const superheroes = JSON.parse(fs.readFileSync('superhero_info.json', 'utf-8'));
    const hero = superheroes.find(h => h.id === parseInt(req.params.id));

    if (!hero) {
        return res.status(404).json({ error: "Superhero not found" });
    }

    // Now, read the superhero_powers.json file to get the powers for the superhero's name
    const powersList = JSON.parse(fs.readFileSync('superhero_powers.json', 'utf-8'));
    
    // Find the powers entry for the given superhero
    const powers = powersList.find(p => p.hero_names === hero.name);
    
    if (!powers) {
        return res.status(404).json({ error: "Powers not found for the superhero" });
    }
    
    // Extract the powers that are marked as "True"
    const truePowers = Object.entries(powers)
        .filter(([key, value]) => key !== 'hero_names' && value === "True")
        .map(([key, _]) => key);

    // Return the hero's name and the true powers
    return res.json({
        name: hero.name,
        powers: truePowers
    });
});

app.get('/superhero/search', (req, res) => {
    // Read the superhero_info.json file
    const superheroes = JSON.parse(fs.readFileSync('superhero_info.json', 'utf-8'));
    const powers_dict = JSON.parse(fs.readFileSync('superhero_powers.json', 'utf-8'));

    // Extract query parameters and convert to lowercase for case-insensitive search
    const nameQuery = req.query.name ? req.query.name.toLowerCase() : null;
    const raceQuery = req.query.race ? req.query.race.toLowerCase() : null;
    const publisherQuery = req.query.publisher ? req.query.publisher.toLowerCase() : null;
    const powersQuery = req.query.powers ? req.query.powers.toLowerCase().split(',') : null;
    const nQuery = req.query.n ? parseInt(req.query.n, 10) : null;
    const sortCriteria = req.query.sort;



    // Check if at least one query parameter is provided
    if (!nameQuery && !raceQuery && !publisherQuery && powersQuery.length === 0) {
        return res.status(400).json({ error: "Provide at least one search parameter (name, race, or publisher)" });
    }


    // Filter superheroes based on the provided query parameters
    const matchedHeroes = superheroes.filter(hero => {
        const matchesName = nameQuery ? hero.name.toLowerCase().includes(nameQuery) : true;
        const matchesRace = raceQuery ? hero.Race.toLowerCase().includes(raceQuery) : true;
        const matchesPublisher = publisherQuery ? hero.Publisher.toLowerCase().includes(publisherQuery) : true;
        const matchesPowers = powersQuery ? powersQuery.every(powerQuery => 
            powers_dict[hero.name] && powers_dict[hero.name].map(p => p.toLowerCase()).includes(powerQuery.toLowerCase())) : true;

        return matchesName && matchesRace && matchesPublisher && matchesPowers;
    });

    
    // If no matches are found, return an appropriate response
    if (matchedHeroes.length === 0) {
        return res.status(404).json({ error: "No superheroes found matching the given criteria" });
    }

    const results = (!nQuery || isNaN(nQuery)) ? matchedHeroes : matchedHeroes.slice(0, nQuery); 

    if (sortCriteria) {
        results.sort((a, b) => {
            switch(sortCriteria) {
                case 'Name':
                case 'Publisher':
                case 'Race':
                    let aValue = a[sortCriteria] ? a[sortCriteria].toLowerCase() : '';
                    let bValue = b[sortCriteria] ? b[sortCriteria].toLowerCase() : '';
                    return aValue.localeCompare(bValue);
                case 'Powers':
                    // Additional logic needed to count powers for each hero
                    // This will require fetching powers data similar to the list details endpoint
                    break;
                default:
                    console.log("Invalid sort criteria provided");
                    break;
            }
        });
    }

    return res.json(results);
});


app.get('/publishers', (req, res) => {
    const superheroes = JSON.parse(fs.readFileSync('superhero_info.json', 'utf-8'));
    const publishers = [...new Set(superheroes.map(hero => hero.Publisher))];
    res.json(publishers);
});

app.post('/list', (req, res) => {
    const { name } = req.body;

    let lists = JSON.parse(fs.readFileSync('listsDatabase.json', 'utf-8'));
    if (lists[name]) {
        return res.status(400).json({ error: "List name already exists" });
    }

    lists[name] = [];
    fs.writeFileSync('listsDatabase.json', JSON.stringify(lists, null, 2));

    res.json({ message: "List created successfully" });
});

app.get('/lists', (req, res) => {
    try {
        let lists = JSON.parse(fs.readFileSync('listsDatabase.json', 'utf-8'));
        // Extract only the list names (which are the keys in the JSON object)
        let listNames = Object.keys(lists);         
        res.json(listNames);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.put('/list/:name', (req, res) => {
    const { name } = req.params;
    const { ids } = req.body;

    let lists = JSON.parse(fs.readFileSync('listsDatabase.json', 'utf-8'));
    if (!lists[name]) {
        return res.status(404).json({ error: "List name does not exist" });
    }

    if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "IDs should be provided as an array" });
    }

    // Convert the IDs from strings to numbers
    const idNumbers = ids.map(Number);

    // Append the IDs to the list, ensuring uniqueness
    lists[name] = idNumbers;

    fs.writeFileSync('listsDatabase.json', JSON.stringify(lists, null, 2));
    res.json({ message: "List updated successfully" });
});



// app.get('/list/:name', (req, res) => {
//     const { name } = req.params;

//     const lists = JSON.parse(fs.readFileSync('listsDatabase.json', 'utf-8'));
//     if (!lists[name]) {
//         return res.status(404).json({ error: "List name does not exist" });
//     }

//     res.json(lists[name]);
// });

app.delete('/list/:name', (req, res) => {
    const { name } = req.params;

    let lists = JSON.parse(fs.readFileSync('listsDatabase.json', 'utf-8'));
    if (!lists[name]) {
        return res.status(404).json({ error: "List name does not exist" });
    }

    delete lists[name];
    fs.writeFileSync('listsDatabase.json', JSON.stringify(lists, null, 2));

    res.json({ message: "List deleted successfully" });
});

app.get('/list/details/:name', (req, res) => {
    const { name } = req.params;
    const sortCriteria = req.query.sort;

    let lists = JSON.parse(fs.readFileSync('listsDatabase.json', 'utf-8'));
    if (!lists[name]) {
        return res.status(404).json({ error: "List name does not exist" });
    }

    const heroIds = [].concat(...lists[name]).map(Number);
    const superheroes = JSON.parse(fs.readFileSync('superhero_info.json', 'utf-8'));
    const powersData = JSON.parse(fs.readFileSync('superhero_powers.json', 'utf-8'));

    let heroesInList = superheroes.filter(hero => heroIds.includes(hero.id)).map(hero => {
        const heroPowers = powersData.find(p => p.hero_names === hero.name);
        hero.powers = heroPowers ? Object.keys(heroPowers).filter(power => heroPowers[power] === "True") : [];
        return hero;
    });
    
    // Sorting based on the provided sortCriteria
    if (sortCriteria) {
        switch(sortCriteria) {
            case 'Name':
            case 'Publisher':
            case 'Race':
                heroesInList.sort((a, b) => {
                    // Using a ternary to handle potential null/undefined values
                    let aValue = a[sortCriteria] ? a[sortCriteria].toLowerCase() : '';
                    let bValue = b[sortCriteria] ? b[sortCriteria].toLowerCase() : '';
                    return aValue.localeCompare(bValue);
                });                break;
            case 'Powers':
                heroesInList.sort((a, b) => b.powers.length - a.powers.length);
                break;
            default:
                console.log("Invalid sort criteria provided");
                break;
        }
    }
    
    res.json(heroesInList);
});


app.get('/list/ids/:name', (req, res) => {
    const { name } = req.params;

    let lists = JSON.parse(fs.readFileSync('listsDatabase.json', 'utf-8'));

    if (!lists[name]) {
        return res.status(404).json({ error: "List name does not exist" });
    }

    const heroIds = lists[name].map(Number); // Convert string IDs to numbers

    res.json(heroIds);
});

app.listen(PORT, () => {
    console.log(`Superhero app listening on port ${PORT}!`);
})

