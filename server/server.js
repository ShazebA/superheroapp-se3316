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



app.listen(PORT, () => {
    console.log(`Superhero app listening on port ${port}!`);
})
