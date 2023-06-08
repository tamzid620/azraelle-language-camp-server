const express = require('express')
const app = express()
require('dotenv').config();
const { MongoClient , ServerApiVersion} = require('mongodb');
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
    // Connect the client to the server (optional starting in v4.7)
    const classCollection = client.db('Azrealle').collection('classes');

    // get all info from api -------------------
    app.get('/classes', async (req, res) => {
      try {
        const result = await classCollection.find().sort({ total_students: -1 }).toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

//popular classes section -------------------
   app.get('/popularclasses', async (req, res) => {
      try {
        const result = await classCollection.find().limit(6).sort({ total_students: -1 }).toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });
//popular instructor section -------------------
app.get('/popularinstructor', async (req, res) => {
  try {
    const result = await classCollection.find().limit(6).sort({ total_students: -1 }).toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.error);



// formal get and listen section --------------------------
app.get('/', (req, res) => {
  res.send('Azreaelle language camp server is running')
})

app.listen(port, () => {
  console.log(`Azreaelle language camp server listening on port ${port}`)
})