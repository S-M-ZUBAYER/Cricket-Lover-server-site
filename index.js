const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;


const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.p2sr91x.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const productCategoriesCollections = client.db('Cricket_Lover').collection('categories');
        app.get('/categories', async (req, res) => {
            const query = {};
            const categories = await productCategoriesCollections.find(query).toArray();
            res.send(categories);
        })

    }
    finally {

    }

}
run().catch(console.log)


app.get('/', async (req, res) => {
    res.send('Cricket lover server is running');
});

app.listen(port, () => console.log(`Cricket lover is running on ${port}`))