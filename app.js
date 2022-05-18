const express = require("express");
const cors = require("cors");
// const mongoose = require("mongoose");

const userServices = require("./models/user-services");

// userServices.createDbConnection();

const app = express();

app.use(cors());
app.use(express.json());

function setDatabaseConn(conn) {
  userServices.setDataBaseConn(conn);
}

// app.connectDB = async () => {
//   await userServices.createDbConnection();
//   // await mongoose.connect(process.env.MONGODB_URI, {
//   //   useNewUrlParser: true,
//   //   useUnifiedTopology: true,
//   // });  
//   // userServices.setDataBase(mongoose);
// }

app.get("/", (req, res) => {
  res.json("Hello World!");
});

app.get("/users", async (req, res) => {
  const name = req.query["name"];
  const job = req.query["job"];
  try {
    const result = await userServices.getUsers(name, job);
    res.json({ users_list: result });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error ocurred in the server.");
  }
});

app.get("/users/:id", async (req, res) => {
  const id = req.params["id"];
  const result = await userServices.findUserById(id);
  if (result === undefined || result === null)
    res.status(404).send("Resource not found.");
  else {
    res.send({ users_list: result });
  }
});

app.post("/users", async (req, res) => {
  const user = req.body;
  const savedUser = await userServices.addUser(user);
  if (savedUser) res.status(201).send(savedUser);
  else res.status(400).end();
});

module.exports = { app, setDatabaseConn } ;