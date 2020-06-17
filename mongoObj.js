const { MongoClient } = require('mongodb');


// This is the connection to mongodb
class MongoDBInstance {
  constructor() {
    const username = process.env.mongodbUsername;
    const mongopass = process.env.mongodbPassword;
    this.uri = `mongodb+srv://${username}:${mongopass}@dwcluster-9q0nx.mongodb.net/<dbname>?retryWrites=true&w=majority`
  }
  async init() {
    const client = await MongoClient.connect(this.uri, {
      useUnifiedTopology: true
    })
    const db = client.db('myApp');
    const priceInfo = db.collection('priceInfo');
    this.priceInfo = priceInfo;
    this.db = db;
    console.log('connected to db')
  }
}

// exporting an instance of mongodb so we can access that instance in our app
module.exports = new MongoDBInstance()
