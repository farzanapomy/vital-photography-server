const express = require('express')
require('dotenv').config();
const app = express()
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000


// middleware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fjoai.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


console.log(uri);



async function run() {
    try {
        await client.connect();
        const database = client.db('vital-photography')
        const serviceCollection = database.collection('services')
        const reviewCollection = database.collection('reviews')
        const orderCollection = database.collection('orders')
        console.log('databases connected');


        // post services and get service and single service
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service)
            console.log(result);
            res.json(result)
        })

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const service = await cursor.toArray();
            res.send(service);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            console.log(service);
            res.json(service)
        })


        // Reviews post and get 
        app.post('/AddReviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            console.log(result);
            res.json('result')
        })

        app.get('/AddReviews', async (req, res) => {
            const cursor = reviewCollection.find({})
            const result = await cursor.toArray();
            console.log('result');
            res.json(result);
        })


        // Orders 
        app.post('/allOrders', async (req, res) => {
            const orders = req.body;
            const result = await orderCollection.insertOne(orders);
            console.log(result);
            res.json(result);
        })

        app.get('/allOrders', async (req, res) => {
            const cursor = orderCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/MyOrders/:email', async (req, res) => {
            const email = req.params.email;
            const newEmail = ({ email: email });
            // const cursor=await 
        })







    }
    finally {
        // await client.close()
    }
}

run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('Server is connected')
})

app.listen(port, () => {
    console.log('server is running at ', port)
})