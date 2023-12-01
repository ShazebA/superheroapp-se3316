const mongoose = require('mongoose');
const fs = require('fs').promises;

// Replace with your MongoDB connection string
const mongoDB = 'mongodb+srv://sashiqu:sashiqu@superhero.i0fq1ho.mongodb.net/?retryWrites=true&w=majority';


const SuperheroSchema = new mongoose.Schema({
    id: Number,
    name: String,
    Gender: String,
    'Eye color': String,
    Race: String,
    'Hair color': String,
    Height: Number,
    Publisher: String,
    'Skin color': String,
    Alignment: String,
    Weight: Number
});


const SuperheroPowerSchema = new mongoose.Schema({
    hero_names: String,
    Agility: String,
    'Accelerated Healing': String,
    'Lantern Power Ring': String,
    'Dimensional Awareness': String,
    'Cold Resistance': String,
    Durability: String,
    Stealth: String,
    'Energy Absorption': String,
    Flight: String,
    'Danger Sense': String,
    'Underwater breathing': String,
    Marksmanship: String,
    'Weapons Master': String,
    'Power Augmentation': String,
    'Animal Attributes': String,
    Longevity: String,
    Intelligence: String,
    'Super Strength': String,
    Cryokinesis: String,
    Telepathy: String,
    'Energy Armor': String,
    'Energy Blasts': String,
    Duplication: String,
    'Size Changing': String,
    'Density Control': String,
    Stamina: String,
    'Astral Travel': String,
    'Audio Control': String,
    Dexterity: String,
    Omnitrix: String,
    'Super Speed': String,
    Possession: String,
    'Animal Oriented Powers': String,
    'Weapon-based Powers': String,
    Electrokinesis: String,
    'Darkforce Manipulation': String,
    'Death Touch': String,
    Teleportation: String,
    'Enhanced Senses': String,
    Telekinesis: String,
    'Energy Beams': String,
    Magic: String,
    Hyperkinesis: String,
    Jump: String,
    Clairvoyance: String,
    'Dimensional Travel': String,
    'Power Sense': String,
    Shapeshifting: String,
    'Peak Human Condition': String,
    Immortality: String,
    Camouflage: String,
    'Element Control': String,
    Phasing: String,
    'Astral Projection': String,
    'Electrical Transport': String,
    'Fire Control': String,
    Projection: String,
    Summoning: String,
    'Enhanced Memory': String,
    Reflexes: String,
    Invulnerability: String,
    'Energy Constructs': String,
    'Force Fields': String,
    'Self-Sustenance': String,
    'Anti-Gravity': String,
    Empathy: String,
    'Power Nullifier': String,
    'Radiation Control': String,
    'Psionic Powers': String,
    Elasticity: String,
    'Substance Secretion': String,
    'Elemental Transmogrification': String,
    'Technopath/Cyberpath': String,
    'Photographic Reflexes': String,
    'Seismic Power': String,
    Animation: String,
    Precognition: String,
    'Mind Control': String,
    'Fire Resistance': String,
    'Power Absorption': String,
    'Enhanced Hearing': String,
    'Nova Force': String,
    Insanity: String,
    Hypnokinesis: String,
    'Animal Control': String,
    'Natural Armor': String,
    Intangibility: String,
    'Enhanced Sight': String,
    'Molecular Manipulation': String,
    'Heat Generation': String,
    Adaptation: String,
    Gliding: String,
    'Power Suit': String,
    'Mind Blast': String,
    'Probability Manipulation': String,
    'Gravity Control': String,
    Regeneration: String,
    'Light Control': String,
    Echolocation: String,
    Levitation: String,
    'Toxin and Disease Control': String,
    Banish: String,
    'Energy Manipulation': String,
    'Heat Resistance': String,
    'Natural Weapons': String,
    'Time Travel': String,
    'Enhanced Smell': String,
    Illusions: String,
    Thirstokinesis: String,
    'Hair Manipulation': String,
    Illumination: String,
    Omnipotent: String,
    Cloaking: String,
    'Changing Armor': String,
    'Power Cosmic': String,
    Biokinesis: String,
    'Water Control': String,
    'Radiation Immunity': String,
    'Vision - Telescopic': String,
    'Toxin and Disease Resistance': String,
    'Spatial Awareness': String,
    'Energy Resistance': String,
    'Telepathy Resistance': String,
    'Molecular Combustion': String,
    Omnilinguism: String,
    'Portal Creation': String,
    Magnetism: String,
    'Mind Control Resistance': String,
    'Plant Control': String,
    Sonar: String,
    'Sonic Scream': String,
    'Time Manipulation': String,
    'Enhanced Touch': String,
    'Magic Resistance': String,
    Invisibility: String,
    'Sub-Mariner': String,
    'Radiation Absorption': String,
    'Intuitive aptitude': String,
    'Vision - Microscopic': String,
    Melting: String,
    'Wind Control': String,
    'Super Breath': String,
    Wallcrawling: String,
    'Vision - Night': String,
    'Vision - Infrared': String,
    'Grim Reaping': String,
    'Matter Absorption': String,
    'The Force': String,
    Resurrection: String,
    Terrakinesis: String,
    'Vision - Heat': String,
    Vitakinesis: String,
    'Radar Sense': String,
    'Qwardian Power Ring': String,
    'Weather Control': String,
    'Vision - X-Ray': String,
    'Vision - Thermal': String,
    'Web Creation': String,
    'Reality Warping': String,
    'Odin Force': String,
    'Symbiote Costume': String,
    'Speed Force': String,
    'Phoenix Force': String,
    'Molecular Dissipation': String,
    'Vision - Cryo': String,
    Omnipresent: String,
    Omniscient: String
});


const SuperheroInfo = mongoose.model('Superhero', SuperheroSchema, 'Superhero_collection');
const SuperheroPowers = mongoose.model('SuperheroPower', SuperheroPowerSchema, 'Superhero_power_collection');


async function insertData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

    // Read JSON data
    const superheroInfoData = JSON.parse(await fs.readFile('superhero_info.json', 'utf8'));
    const superheroPowersData = JSON.parse(await fs.readFile('superhero_powers.json', 'utf8'));

    // Insert data using insertMany, which returns a promise
    await SuperheroInfo.insertMany(superheroInfoData);
    console.log('Superhero info inserted');

    await SuperheroPowers.insertMany(superheroPowersData);
    console.log('Superhero powers inserted');

    // Close the connection once done
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

insertData();
