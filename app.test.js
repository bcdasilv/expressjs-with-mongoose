const appModule = require("./app");
const supertest = require("supertest");
const database = require("./database");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const UserSchema = require("./models/user");
const mockingoose = require("mockingoose");

/**
 * This is an example of API Testing. 
 * This example demonstrates three strategies for testing API endpoints:
 * 1) Mocking up the db calls
 * 2) Connecting to an actual database based on the URL in a env variable.
 * 3) Connecting to an in-memory database
 * 
 * Libraries used besides jest: 
 *  Mockingoose: for mocking the database calls (if using this strategy)
 *  Supertest: for making calls to your API endpoints.
 *  MongoMemoryServer: for the in-memory db (if using this strategy)
 */

let userModel;

let mongoServer;
let inMemoryConn;

async function connectToClouDbHelper() {
  try {
    appModule.setDatabaseConn(await database.connect());
  }catch(error) {
    console.log(error);
  }
}

async function connectToInMemoryDbHelper() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  inMemoryConn = await mongoose.createConnection(uri, mongooseOpts);
  appModule.setDatabaseConn(inMemoryConn);
}

beforeAll(async () => {
  // Three set up options:

  /**
   * 1)
   *  Use the following set up when mocking db calls.
   *  Setting an empty db connection.
  */
   appModule.setDatabaseConn(mongoose.connection);
   userModel = mongoose.model("User", UserSchema);

  /**
   * 2) 
   *  Use the following set up when utilizing the 
   *  database.js module to connect to an actual DB.
   */
  //  await connectToClouDbHelper();

  /**
   * 3)
   *  Use the following set up when utilizing the
   *  in-memory DB for testing purposes without mocking up
   *  db calls.
   */
  //  await connectToInMemoryDbHelper();
});

afterAll(async () => {
  // If using option (2)
  // await database.disconnect();

  //If using option (3)
  // await inMemoryConn.dropDatabase();
  // await inMemoryConn.close();
  // await mongoServer.stop();
});

beforeEach(async () => {
  // If using option (1)
  jest.clearAllMocks();
  mockingoose.resetAll();  
});

afterEach(async () => {
 
});

test("dummy", async () => {
  const result = await supertest(appModule.app)
  .get("/")
  .expect(200);

  expect(result.body).toBe("Hello World!");
});

test("Fetching users by name", async () => {
  
  //If using option (1)
  userModel.find = jest.fn().mockResolvedValue(
    [
      {name: "Ted Lasso", job: "Soccer coach"},
      {name: "Ted Lasso", job: "Footbal coach"}
    ]
  );
  
  const name = "Ted Lasso";
  const result = await supertest(appModule.app)
  .get("/users?name="+name)
  .expect(200);

  expect(result.body).toHaveProperty("users_list");
  expect(result.body.users_list.length).toBeGreaterThanOrEqual(0);
  result.body.users_list.forEach(user => expect(user.name).toBe(name));

  //If using option (1)
  // Mock-related assertions
  //The mocked function (mongoose find) should be called only once
  expect(userModel.find.mock.calls.length).toBe(1);
  // and should be called with no params
  expect(userModel.find).toHaveBeenCalledWith({name: name});
});

test("Fetching users by job", async () => {
  const result = [
    {
      name: "Pepe Guardiola",
      job: "Soccer coach",
    },
    {
      name: "Ted Lasso",
      job: "Soccer coach",
    }    
  ];
  userModel.find = jest.fn().mockResolvedValue(result);

  const userJob = "Soccer coach";

  const response = await supertest(appModule.app)
  .get("/users?job="+userJob)
  .expect(200);

  expect(response.body).toHaveProperty("users_list");
  expect(response.body.users_list.length).toBeGreaterThanOrEqual(0);
  response.body.users_list.forEach(user => expect(user.job).toBe(userJob));  

  expect(userModel.find.mock.calls.length).toBe(1);
  expect(userModel.find).toHaveBeenCalledWith({job: userJob});
});

test("Fetching by id and finding", async () => {
  const dummyUser = {
    _id: "007",
    name: "Harry Potter",
    job: "Young wizard"
  };
  userModel.findById = jest.fn().mockResolvedValue(dummyUser);

  const response = await supertest(appModule.app)
  .get("/users/007")
  .expect(200);

  console.log(response)
  expect(response.body).toHaveProperty("users_list");
  
  const found = response.body.users_list;
  expect(found._id).toBe(dummyUser._id);
  expect(found.name).toBe(dummyUser.name);
  expect(found.job).toBe(dummyUser.job);

  expect(userModel.findById.mock.calls.length).toBe(1);
  expect(userModel.findById).toHaveBeenCalledWith("007");  
});

test("Adding user -- failure path with invalid job length", async () => {
  const toBeAdded = {
    name: "Harry Potter",
    job: "Y",
  };

  mockingoose(userModel).toReturn({}, 'save');

  const response = await supertest(appModule.app)
    .post("/users")
    .send(toBeAdded)
    .set("Accept", "application/json")
    .expect(400)  

  expect(response.body).toMatchObject({});
});

// WARNING: If connected to a real db, this will add a document to it.
test("Adding user -- successful path", async () => {
  const addedUser = {
    _id : "some id...",
    name: "Harry Potter",
    job: "Young wizard"
  };
  const toBeAdded = {
    name: "Harry Potter",
    job: "Young wizard"
  };
  //Using mockingoose
  mockingoose(userModel).toReturn(addedUser, 'save');

  const response = await supertest(appModule.app)
    .post("/users")
    .send(toBeAdded)
    .set("Accept", "application/json")
    .expect("Content-type", /json/)
    .expect(201)

  expect(response.body).toBeTruthy();
  expect(response.body.name).toBe(toBeAdded.name);
  expect(response.body.job).toBe(toBeAdded.job);
  expect(response.body).toHaveProperty("_id");

});