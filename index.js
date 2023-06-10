const express = require('express')
const app = express()
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const selectCollection = client.db('Azrealle').collection('select');
    const usersCollection = client.db('Azrealle').collection('users');


    // app.get -----------------------
    app.get('/classes', async (req, res) => {
      try {
        const result = await classCollection.find().toArray();
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

    // all classes info section  -------------------
    app.get('/allclasses', async (req, res) => {
      try {
        const result = await classCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    // all instructors info section  -------------------
    app.get('/allinstructors', async (req, res) => {
      try {
        const result = await classCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    //  class select section -------------------

    app.post('/classselect/:email', async (req, res) => {
      const email = req.params.email;
      const data = req.body;
      data.email = email;

      const result = await selectCollection.insertOne(data);
      res.send(result);
    });

    app.get('/classselect/:email', async (req, res) => {
      const email = req.params.email;
      const result = await selectCollection.find({ email }).toArray();
      res.send(result);
    });

    app.delete('/classselect/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await selectCollection.deleteOne(query);
      res.send(result);
    })


    // user section -----------------------
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = {email: user.email};
      const existingUser = await usersCollection.findOne(query)
      if(existingUser){
        return res.send({ message: 'user already exists' });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get('/users',  async(req ,res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    app.delete('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    })

    // admin section ------------------------
    app.patch('/users/admin/:id' , async(req, res) => {
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)};
      const updateDoc = {
        $set :{
          role: 'admin'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })


    // instructor section ------------------------
    app.patch('/users/instructor/:id' , async(req, res) => {
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)};
      const updateDoc = {
        $set :{
          role: 'instructor'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })
  


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