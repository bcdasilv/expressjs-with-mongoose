const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const userServices = require("./models/user-services");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const fakeUser = {username: "", pwd: ""};

function generateAccessToken(username) {
  return jwt.sign({"username": username}, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
}

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const pwd = req.body.pwd;
  // Call a model function to retrieve an existing user based on username 
  //  (or any other unique identifier such as email if that applies to your app)
  // Using our fake user for demo purposes
  const retrievedUser = fakeUser;
  if (retrievedUser.username && retrievedUser.pwd) {
    const isValid = await bcrypt.compare(pwd, retrievedUser.pwd);
    if (isValid) {
      // Generate token and respond
      const token = generateAccessToken(username);
      res.status(200).send(token);
    } else {
      //Unauthorized due to invalid pwd
      res.status(401).send("Unauthorized");
    }
  } else {
    //Unauthorized due to invalid username
    res.status(401).send("Unauthorized");
  }
}); 

app.post("/signup", async (req, res) => {
  const username = req.body.username;
  const userPwd = req.body.pwd; 
  if (!username && !pwd) {
    res.status(400).send("Bad request: Invalid input data.");
  } else {
    // generate salt to hash password
    /* Made up of random bits added to each password instance before its hashing. 
    Salts create unique passwords even in the instance of two users choosing the 
    same passwords. Salts help us mitigate hash table attacks by forcing attackers 
    to re-compute them using the salts for each user.
    More info: https://auth0.com/blog/adding-salt-to-hashing-a-better-way-to-store-passwords/
    */
    const salt = await bcrypt.genSalt(10);
    // On the database you never store the user input pwd. 
    // So, let's hash it:
    const hashedPWd = await bcrypt.hash(userPwd, salt);
    // Now, call a model function to store the username and hashedPwd (a new user)
    // For demo purposes, I'm skipping the model piece, and assigning the new user to this fake obj
    fakeUser.username = username;
    fakeUser.pwd = hashedPWd
    
    const token = generateAccessToken(username);
    res.status(201).send(token);
  }
});

/* Using this funcion as a "middleware" function for
  all the endpoints that need access control protecion */
function authenticateUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  //Getting the 2nd part of the auth hearder (the token)
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log("No token received");
    return res.status(401).end();
  } else {
    // If a callback is supplied, verify() runs async
    // If a callback isn't supplied, verify() runs synchronously
    // verify() throws an error if the token is invalid
    try {
      // verify() returns the decoded obj which includes whatever objs
      // we use to code/sign the token
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET)   
      // in our case, we used the username to sign the token
      console.log(decoded);
      next()
    } catch (error) {
      console.log(error);
      return res.status(401).end();  
    }
  }
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Turned this endpoint protected with access control
// See the authenticateUser function being passed as a middleware function
app.get("/users", authenticateUser, async (req, res) => {
  const name = req.query["name"];
  const job = req.query["job"];
  try {
    const result = await userServices.getUsers(name, job);
    res.send({ users_list: result });
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
  else res.status(500).end();
});

app.listen(process.env.PORT || port, () => {
  console.log("REST API is listening.");
});
