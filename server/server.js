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



app.listen(PORT, () => {
    console.log(`Superhero app listening on port ${PORT}!`);
})
