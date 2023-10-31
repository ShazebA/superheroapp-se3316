const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;


app.get('/', (req, res) => {
    res.send('Hello, Superhero API!');
});

app.get('/superhero/:id', (req, res) => {
    // Read the superhero_info.json file
    const superheroes = JSON.parse(fs.readFileSync('superhero_info.json', 'utf-8'));
    
    // Find the superhero by ID
    const hero = superheroes.find(h => h.id === parseInt(req.params.id));
    
    if (!hero) {
        return res.status(404).json({ error: "Superhero not found" });
    }
    
    return res.json(hero);
});

app.get('/superhero/:id/powers', (req, res) => {
    // Read the superhero_powers.json file
    const powersList = JSON.parse(fs.readFileSync('superhero_powers.json', 'utf-8'));
    
    // Find the powers by hero name (assuming hero names are unique)
    const powers = powersList.find(p => p.hero_names === req.params.id);
    
    if (!powers) {
        return res.status(404).json({ error: "Powers not found for the superhero" });
    }
    
    return res.json(powers);
});

app.get('/publishers', (req, res) => {
    const superheroes = JSON.parse(fs.readFileSync('superhero_info.json', 'utf-8'));
    const publishers = [...new Set(superheroes.map(hero => hero.Publisher))];
    res.json(publishers);
});

app.get('/search', (req, res) => {
    const { field, pattern, n } = req.query;

    const superheroes = JSON.parse(fs.readFileSync('superhero_info.json', 'utf-8'));
    const matchedHeroes = superheroes
        .filter(hero => hero[field] && hero[field].toLowerCase().includes(pattern.toLowerCase()))
        .slice(0, n ? parseInt(n) : undefined)
        .map(hero => hero.id);

    if (matchedHeroes.length === 0) {
        return res.status(404).json({ error: "No superheroes found" });
    }

    res.json(matchedHeroes);
});

app.post('/list', (req, res) => {
    const { name } = req.body;

    let lists = JSON.parse(fs.readFileSync('lists.json', 'utf-8'));
    if (lists[name]) {
        return res.status(400).json({ error: "List name already exists" });
    }

    lists[name] = [];
    fs.writeFileSync('lists.json', JSON.stringify(lists, null, 2));

    res.json({ message: "List created successfully" });
});

app.put('/list/:name', (req, res) => {
    const { name } = req.params;
    const { ids } = req.body;

    let lists = JSON.parse(fs.readFileSync('lists.json', 'utf-8'));
    if (!lists[name]) {
        return res.status(404).json({ error: "List name does not exist" });
    }

    lists[name] = ids;
    fs.writeFileSync('lists.json', JSON.stringify(lists, null, 2));

    res.json({ message: "List updated successfully" });
});

app.get('/list/:name', (req, res) => {
    const { name } = req.params;

    const lists = JSON.parse(fs.readFileSync('lists.json', 'utf-8'));
    if (!lists[name]) {
        return res.status(404).json({ error: "List name does not exist" });
    }

    res.json(lists[name]);
});

app.delete('/list/:name', (req, res) => {
    const { name } = req.params;

    let lists = JSON.parse(fs.readFileSync('lists.json', 'utf-8'));
    if (!lists[name]) {
        return res.status(404).json({ error: "List name does not exist" });
    }

    delete lists[name];
    fs.writeFileSync('lists.json', JSON.stringify(lists, null, 2));

    res.json({ message: "List deleted successfully" });
});

app.get('/list/:name/details', (req, res) => {
    const { name } = req.params;

    const lists = JSON.parse(fs.readFileSync('lists.json', 'utf-8'));
    if (!lists[name]) {
        return res.status(404).json({ error: "List name does not exist" });
    }

    const superheroes = JSON.parse(fs.readFileSync('superhero_info.json', 'utf-8'));
    const powersList = JSON.parse(fs.readFileSync('superhero_powers.json', 'utf-8'));

    const details = lists[name].map(id => {
        const hero = superheroes.find(h => h.id === id);
        const powers = powersList.find(p => p.hero_names === hero.name);
        return { hero, powers };
    });

    res.json(details);
});



app.listen(PORT, () => {
    console.log(`Superhero app listening on port ${PORT}!`);
})
