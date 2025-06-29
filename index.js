const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1joky5l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const usersCollection = client.db("hobbyUser").collection("users");
    const hobbyCollection = client.db("hobbyBd").collection("hobbies");

    // hobbies api
    app.get("/hobbies", async (req, res) => {
      const { sort, category } = req.query;
      let query = {};
      let sortOption = {};

      if (category) {
        query.category = { $regex: category, $options: "i" };
      }
      if (sort === "asc") {
        sortOption.name = 1;
      } else if (sort === "desc") {
        sortOption.name = -1;
      }
      const result = await hobbyCollection
        .find(query)
        .sort(sortOption)
        .toArray();
      res.send(result);
    });
    app.get("/hobbies/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await hobbyCollection.findOne(query);
      res.send(result);
    });
    app.post("/hobbies", async (req, res) => {
      const hobby = req.body;
      const result = await hobbyCollection.insertOne(hobby);
      res.send(result);
    });
    app.put("/hobbies/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateHobby = req.body;
      const updatedDoc = {
        $set: updateHobby,
      };
      const result = await hobbyCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    app.delete("/hobbies/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await hobbyCollection.deleteOne(query);
      res.send(result);
    });

    // user api
    app.get("/user", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.post("/user", async (req, res) => {
      const users = req.body;
      const result = await usersCollection.insertOne(users);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);
app.get("/", async (req, res) => {
  res.send("Server is running");
});
app.listen(port, () => {
  console.log(`app is running in the port ${port}`);
});
