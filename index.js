const express = require('express')
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware ------------------
app.use(cors());
app.use(express.json());




// formal get and listen section --------------------------
app.get('/', (req, res) => {
  res.send('Azreaelle language camp server is running')
})

app.listen(port, () => {
  console.log(`Azreaelle language camp server listening on port ${port}`)
})