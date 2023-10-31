const express = require('express');
const app = express();


app.get('/', (req, res) => {
    res.send('Hello, Superhero API!');
});


const port = 3000;

app.listen(port, () => {
    console.log(`Superhero app listening on port ${port}!`);
})
