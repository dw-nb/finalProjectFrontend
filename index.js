const express = require('express')
const app = express();
const port = 4000;

// make API calls
const fetch = require('node-fetch');

// Serve up static files
app.use(express.static('public'));

// Serve up dotenv files
require('dotenv').config()

// for reading objectId's saved as a string
const { ObjectId } = require('mongodb')

// bring in the db and initialise it
const database = require('./mongoObj')
database.init();

// read forms sent from the client to the server
const bodyParser = require("body-parser")

// let our app use body parser
app.use(bodyParser.json())

// This is gets the data from the mongodb instance
app.get('/getPriceInfo', async (req, res) => {
  const data = await database.priceInfo.find().toArray();
  console.log("Pricing information has been successfully retrieved from mongodb, well done");
  res.json(data)
})

// This lets us know that we are active and which port we are accessing
app.listen(port, () => console.log(`Actively running on port: ${port}`))
