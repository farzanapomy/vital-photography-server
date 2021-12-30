const express = require('express')
require('dotenv').config();
const app = express()
const cors = require("cors");

const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const stripe = require('stripe')(process.env.STRIPE_SECRET)
// console.log(stripe);



const port = process.env.PORT || 5000


// middleware 
app.use(cors())
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
        const userCollection = database.collection('users')
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
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.findOne(query)
            console.log(result);
            res.json(result)
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

        app.get('/allOrders/:email', async (req, res) => {
            const email = req.params.email;
            const newEmail = ({ email: email });
            console.log(newEmail)
            const cursor = orderCollection.find(newEmail);
            const result = await cursor.toArray();
            console.log(result);
            res.send(result);
        })


        // payment system 

        app.get('/payment/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.findOne(query)
            console.log(result);
            res.send(result)
        })


        app.delete('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query);
            console.log(result);
            res.json(result)
        })

        app.post('/create-payment-intent', async (req, res) => {
            const paymentInfo = req.body;
            // console.log(paymentInfo)
            const amount = paymentInfo.price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            res.json({ clientSecret: paymentIntent.client_secret })

        })

        app.put('/myOrder/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    payment: payment
                }
            };
            const result = await orderCollection.updateOne(query, updateDoc)
            console.log(result)
            res.json(result)

        })



        // user sections

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user)
            const result = await userCollection.insertOne(user);
            res.json(result)
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false
            if (user?.role == 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        app.put('/users/makeAdmin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            console.log(filter);
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
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