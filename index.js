const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra')
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yf6o8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('orders'));
app.use(fileUpload());

// root 
app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

// mongodb
client.connect(err => {
    const ordersCollection = client.db("creativeAgency").collection("orders");
    const reviewsCollection = client.db("creativeAgency").collection("reviews");
    const adminsCollection = client.db("creativeAgency").collection("admins");

    // add Order
    app.post('/addOrder', (req, res) => {
        const file = req.files.file;
        const { name, email, title, description, price } = req.body;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        ordersCollection.insertOne({ name, email, title, description, price, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // user services
    app.get('/serviceList/:email', (req, res) => {
        const userEmail = req.params.email;
        ordersCollection.find({ email: userEmail })
        .toArray( (err, documents) => {
            res.send(documents)
        })
    })

    // add review
    app.post('/addReview', (req, res) => {
        const review = req.body;
        reviewsCollection.insertOne(review)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // get all reviews
    app.get('/reviews', (req, res) => {
        reviewsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // admin
    // all service get for admin
    app.get('/allService', (req, res) => {
        ordersCollection.find({})
        .toArray((err,documents) => {
            res.send(documents);
        })
    })

    // make a admin
    app.post('/makeAdmin', (req, res) => {
        const email = req.body.email
        adminsCollection.insertOne({email: email})
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

    // check is admin or not
    app.get('/isAdmin/:email', (req, res) => {
        const email = req.params.email;
        adminsCollection.find({email: email})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    console.log('database connected');
});


const port = 5000
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})