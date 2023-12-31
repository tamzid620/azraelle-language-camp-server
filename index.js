const express = require('express')
const app = express()
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)

// middleware ------------------
app.use(cors());
app.use(express.json());

// verifyJWT section --------------------------

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'UnAuthorization Access' });
  }
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.JWT_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).send({ error: true, message: 'UnAuthorization Access' })
    }
    req.decoded = decoded;
    next();
  })
}



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




    // collection section ----------------------------------------------------------------> 
    const classCollection = client.db('Azrealle').collection('classes');
    const addclassCollection = client.db('Azrealle').collection('addclass');
    const selectCollection = client.db('Azrealle').collection('select');
    const usersCollection = client.db('Azrealle').collection('users');
    const paymentCollection = client.db('Azrealle').collection('payments');
    // collection section ----------------------------------------------------------------> 


    // jwt section -----------------------

    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_TOKEN_SECRET, { expiresIn: '7d' })

      res.send({ token })
    })






    //admin verify jwt section -------------

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email }
      const user = await usersCollection.findOne(query);
      if (user?.role !== 'admin') {
        return res.status(403).send({ error: true, message: 'Access Denied' });
      }
      next();
    }






    //admin verify jwt section -------------

    const verifyInstructor = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email }
      const user = await usersCollection.findOne(query);
      if (user?.role !== 'instructor') {
        return res.status(403).send({ error: true, message: 'Access Denied' });
      }
      next();
    }


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


    //  my selected select section -------------------

    app.post('/classselect/:email', async (req, res) => {
      const email = req.params.email;
      const data = req.body;
      data.email = email;

      const result = await selectCollection.insertOne(data);
      res.send(result);
    });

//  my enrolled class section -------------------
app.get('/enrolledclass', async (req, res) => {
  try {
    const result = await paymentCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//  payment history section -------------------
app.get('/paymenthistory', async (req, res) => {
  try {
    const result = await paymentCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



    app.get('/classselect/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      if (!email) {
        return res.send([]);
      }
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ error: true, message: 'Access Denied' })
      }

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
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exists' });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });




    app.get('/users',verifyJWT , verifyAdmin , async (req, res) => {
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

    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.get('/users/admin/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;

      if (req.decoded.email !== email) {
        res.send({ admin: false })
      }

      const query = { email: email }
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === 'admin' }
      res.send(result)
    })

    // manage classes section =================> 
    app.get('/manageclass',  async (req, res) => {
      try {
        const result = await addclassCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    // instructor section ------------------------

    app.patch('/users/instructor/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'instructor'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })



    
    app.get('/users/instructor/:email',verifyJWT, async (req, res) => {
      const email = req.params.email;

      if (req.decoded.email !== email) {
        res.send({ instructor : false })
      }

      const query = { email: email }
      const user = await usersCollection.findOne(query);
      const result = { instructor: user?.role === 'instructor' }
      res.send(result)
    })
 
    // add class section =================> 

    app.post('/addaclass', async (req, res) => {
      const newclass = req.body;

      const result = await addclassCollection.insertOne(newclass);
      res.send(result);
    });

    // my classes secion ==============> 
    app.get('/myclasses',  async (req, res) => {
      try {
        const result = await addclassCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });


 // update toy ---------------------------------------------------------------
app.put("/updateclass/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const data = req.body;
  const query = { _id: ObjectId(id) };
  const updateclass = {
    $set: {
      class_name: data.class_name,
      available_seats: data.available_seats,
      class_price: data.class_price
    },
  };
  const result = await addclassCollection.updateOne(query, updateclass);
  res.json(result);
});

    
// Payment section --------------------> 
app.post('/create-payment-intent/:id', verifyJWT, async (req, res) => {
  const { class_price } = req.body;
  const amount = class_price * 100;
  console.log(class_price,amount);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    payment_method_types: ['card']
  });
  res.send({
    clientSecret: paymentIntent.client_secret
  })
})

// payment get ---------------------------->

app.post('/payments/:id', verifyJWT, async (req, res) => {
  const id = req.params.id; 
  const payment = req.body;
  const insertResult = await paymentCollection.insertOne(payment);

  const query =  {_id: new ObjectId(payment.selectClassItems)};
  const deleteResult = await paymentCollection.deleteMany(query);

  res.send({ insertResult, deleteResult, id }); 
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