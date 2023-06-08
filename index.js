const express = require('express')
const app = express()
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware ------------------
app.use(cors());
app.use(express.json());

// mongodb section ------------------------------

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qtemx5j.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const courseCollection = client.db("AzraelleCamp").collection("courses");
    app.get('/courses' , async(req, res) => {
        const result = await courseCollection.find().toArray();
        res.send(result);
    }) 

    await client.connect();
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);


// formal get and listen section --------------------------
app.get('/', (req, res) => {
  res.send('Azreaelle language camp server is running')
})

app.listen(port, () => {
  console.log(`Azreaelle language camp server listening on port ${port}`)
})