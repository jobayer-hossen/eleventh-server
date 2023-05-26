const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 9000 ;

//  middleware
// app.use(cors());
app.use(express.json());
const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
}
app.use(cors(corsConfig))
app.options("", cors(corsConfig))




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hxrsyqo.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // client.connect();


    const robotCollection = client.db('toyDB').collection('addToy');

        // Creating index on two fields
       

        app.get('/addToy', async(req,res)=>{
          const cursor = robotCollection.find();
          const result = await cursor.toArray();
          res.send(result);
        });


        app.get("/searchName/:text", async (req, res) => {
          const indexKeys = { name: 1 }; // Replace field1 and field2 with your actual field names
          const indexOptions = { name:"name" }; // Replace index_name with the desired index name
          const result2 = await robotCollection.createIndex(indexKeys, indexOptions);
          const text = req.params.text;
          const result = await robotCollection
            .find({
              $or: [
                { name: { $regex: text, $options: "i" } },
              ],
            })
            .toArray();
          res.send(result);
        });    

      

    app.post('/addToy' , async(req,res)=>{
        const addToy = req.body;
        const result = await robotCollection.insertOne(addToy);
        res.send(result);
      });

      

      app.get('/toy/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const result = await robotCollection.findOne(query);
        res.send(result);
      });

      app.get('/category/:text' , async(req,res)=>{
        const result = await robotCollection 
        .find({category : req.params.text})
        .toArray()
        res.send(result)
      });

      app.get('/myToy/:email', async (req, res) => {
        const {sort} = req.query;
        const option = {price : sort === 'ascending' ? 1 : -1}
        const result = await robotCollection
          .find({userEmail :req.params.email })
          .sort(option)
          .toArray();
        res.send(result);
      });



      app.put('/updateToy/:id' , async(req,res)=>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updateToy = {
          $set: {
            price: req.body.price,
            quantity: req.body.quantity,
            description: req.body.description,
          },
        };
        const result = await robotCollection.updateOne(query,updateToy);
        res.send(result);
      })


      app.delete('/myToy/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = await robotCollection.deleteOne(query);
        res.send(result);
       });





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.get('/',(req,res)=>{
    res.send(' all robot coming')
});

app.listen(port ,()=>{
    console.log(`roboland server is running port : ${port}`)
});
