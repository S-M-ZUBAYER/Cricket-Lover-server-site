const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
require('dotenv').config();
const port = process.env.PORT || 5000;


const app = express();

app.use(cors());
app.use(express.json());


function verifyJwtToken(req, res, next) {
    const authenticHeader = req.headers.authorization;
    if (!authenticHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }

    const token = authenticHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.p2sr91x.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const productCategoriesCollections = client.db('Cricket_Lover').collection('categories');
        const productsCollections = client.db('Cricket_Lover').collection('products');
        const bookingCollections = client.db('Cricket_Lover').collection('bookings');
        const usersCollections = client.db('Cricket_Lover').collection('users');
        console.log('database connected ')

        //users info
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            }
            const result = await usersCollections.updateOne(filter, updateDoc, options);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '7d'
            });
            res.send({ result, token });
        })
        // app.put('/product/:id', async (req, res) => {
        //     const id = req.params.id;
        //     console.log(id)
        //     const user = req.body;
        //     const filter = { _id: ObjectId(id) };
        //     const options = { upsert: true };
        //     const updateDoc = {
        //         $set: user
        //     }
        //     const result = await usersCollections.updateOne(filter, updateDoc, options);
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        //         expiresIn: '7d'
        //     });
        //     res.send({ result, token });
        // })

        // update for advertise
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    advertise: true
                }
            }
            const result = await productsCollections.updateOne(filter, updatedDoc, options);
            res.send(result);
        })


        app.get('/products/:category', async (req, res) => {
            const categoryName = req?.params?.category;
            const query = {
                category: categoryName
            }
            const products = await productsCollections.find(query).toArray();
            res.send(products);
        })

        //find all categories
        app.get('/categories', async (req, res) => {
            const query = {};
            const categories = await productCategoriesCollections.find(query).toArray();
            res.send(categories);
        })


        //my orders
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            // const decodedEmail = req.decoded.email;
            // if (email !== decodedEmail) {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }
            const query = { email: email };
            const bookings = await bookingCollections.find(query).toArray();
            res.send(bookings);
        });
        //my products
        app.get('/products', async (req, res) => {
            const email = req.query.email;
            // const decodedEmail = req.decoded.email;
            // if (email !== decodedEmail) {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }
            const query = { email: email };
            const products = await productsCollections.find(query).toArray();
            res.send(products);
        });


        // add product 
        app.post('/products', async (req, res) => {
            const user = req.body;
            const result = await productsCollections.insertOne(user);
            res.send(result);
        });

        // booking 
        app.post('/bookings', async (req, res) => {
            const user = req.body;
            const result = await bookingCollections.insertOne(user);
            res.send(result);
        });


        //all users
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollections.find(query).toArray();
            res.send(users)
        })

        //one user info
        app.get('/user', async (req, res) => {
            const email = req.query.email;
            // const decodedEmail = req.decoded.email;
            // if (email !== decodedEmail) {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }
            const query = { email: email };
            const user = await usersCollections.findOne(query);
            res.send(user);
        });


        // delete user
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollections.deleteOne(filter);
            res.send(result)
        });


    }

    finally {

    }

}
run().catch(console.log)


app.get('/', async (req, res) => {
    res.send('Cricket lover server is running');
});

app.listen(port, () => console.log(`Cricket lover is running on ${port}`))