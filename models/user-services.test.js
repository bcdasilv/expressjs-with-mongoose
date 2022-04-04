/**
 * This test suite contains two mocking strategies
 * for mock testing database interactions:
 * 1. Using the built-in jest mocking lib
 * 2. Using mockingoose -- a specific lib for mocking up
 *    mongoose calls.
 */
const mongoose = require("mongoose");
const UserSchema = require("./user");
const userServices = require("./user-services");
const mockingoose = require('mockingoose');

let userModel;

beforeAll(async () => {
  userModel = mongoose.model("User", UserSchema);
});

afterAll(async () => {

});

beforeEach(async () => {
  jest.clearAllMocks();
  mockingoose.resetAll();
});

afterEach(async () => {
  
});

test("Fetching all users", async () => {
  //Mocking up the mongoose find() call
  userModel.find = jest.fn().mockResolvedValue([]);

  //Calling our getUsers() function which is our function under test
  // That function depends on the mongoose find() function that's mocked
  const users = await userServices.getUsers();

  // business-logic-related assertions
  expect(users).toBeDefined();
  expect(users.length).toBeGreaterThanOrEqual(0);

  // Mock-related assertions
    //The mocked function (mongoose find) should be called only once
  expect(userModel.find.mock.calls.length).toBe(1);
    // and should be called with no params
  expect(userModel.find).toHaveBeenCalledWith();
});

test("Fetching users by name", async () => {
  const result = [
    {
      name: "Ted Lasso",
      job: "Football coach",
    },
    {
      name: "Ted Lasso",
      job: "Soccer coach",
    }    
  ];
  //Mocking up the mongoose find() call with a certain value to be
    // returned.
  userModel.find = jest.fn().mockResolvedValue(result);

  //Calling our getUsers() function which is our function under test
  // That function depends on the mongoose find() function that's mocked  
  const userName = "Ted Lasso";
  const users = await userServices.getUsers(userName);

  // business-logic-related assertions
  expect(users).toBeDefined();
  expect(users.length).toBeGreaterThan(0);
  users.forEach((user) => expect(user.name).toBe(userName));

  // Mock-related assertions
    //The mocked function (mongoose find) should be called only once  
  expect(userModel.find.mock.calls.length).toBe(1);
    // and should be called with the following param  
  expect(userModel.find).toHaveBeenCalledWith({name: userName});
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
  const users = await userServices.getUsers(undefined, userJob);

  expect(users).toBeDefined();
  expect(users.length).toBeGreaterThan(0);
  users.forEach((user) => expect(user.job).toBe(userJob));

  expect(userModel.find.mock.calls.length).toBe(1);
  expect(userModel.find).toHaveBeenCalledWith({job: userJob});
});

// test("Fetching users by name and job", async () => {
//   const userName = "Ted Lasso";
//   const userJob = "Soccer coach";
//   const users = await userServices.getUsers(userName, userJob);
//   expect(users).toBeDefined();
//   expect(users.length).toBeGreaterThan(0);
//   users.forEach(
//     (user) => expect(user.name).toBe(userName) && expect(user.job).toBe(userJob)
//   );
// });

test("Fetching by invalid id format", async () => {
  const anyId = "123";

  userModel.findById = jest.fn().mockResolvedValue(undefined);
  
  //or with mockingoose
  // mockingoose(userModel).toReturn(undefined, 'findById');


  const user = await userServices.findUserById(anyId);
  expect(user).toBeUndefined();

  expect(userModel.findById.mock.calls.length).toBe(1);
  expect(userModel.findById).toHaveBeenCalledWith(anyId);

});

test("Fetching by valid id and not finding", async () => {
  const anyId = "6132b9d47cefd0cc1916b6a9";

  //or with mockingoose
  // mockingoose(userModel).toReturn(null, 'findById');
  userModel.findById = jest.fn().mockResolvedValue(null);

  const user = await userServices.findUserById(anyId);
  expect(user).toBeNull();

  expect(userModel.findById.mock.calls.length).toBe(1);
  expect(userModel.findById).toHaveBeenCalledWith(anyId);  
});

test("Fetching by valid id and finding", async () => {
  const dummyUser = {
    _id: "some id...",
    name: "Harry Potter",
    job: "Young wizard"
  };
  
  userModel.findById = jest.fn().mockResolvedValue(dummyUser);

  const foundUser = await userServices.findUserById("some id...");
  expect(foundUser).toBeDefined();
  expect(foundUser.id).toBe(dummyUser.id);
  expect(foundUser.name).toBe(dummyUser.name);
  expect(foundUser.job).toBe(dummyUser.job);

  expect(userModel.findById.mock.calls.length).toBe(1);
  expect(userModel.findById).toHaveBeenCalledWith("some id...");  
});

test("Deleting a user by Id -- successful path", async () => {
  const dummyUser = {
    _id: "some id...",
    name: "Harry Potter",
    job: "Young wizard"
  };
  userModel.findOneAndDelete = jest.fn().mockResolvedValue(dummyUser);

  const deleteResult = await userServices.deleteUser(dummyUser._id);
  expect(deleteResult).toBeTruthy();
  expect(deleteResult.name).toBe(dummyUser.name);

  expect(userModel.findOneAndDelete.mock.calls.length).toBe(1);
  expect(userModel.findOneAndDelete).toHaveBeenCalledWith({ _id: dummyUser._id });  
});

test("Deleting a user by Id -- inexisting id", async () => {
  const anyId = "6132b9d47cefd0cc1916b6a9";

  userModel.findOneAndDelete = jest.fn().mockResolvedValue(null);

  const deleteResult = await userModel.findOneAndDelete({ _id: anyId });
  expect(deleteResult).toBeNull();

  expect(userModel.findOneAndDelete.mock.calls.length).toBe(1);
  expect(userModel.findOneAndDelete).toHaveBeenCalledWith({ _id: anyId });
});

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
  // We can't mock the mongoose save function using jest purely.
  // userModel.save = jest.fn().mockResolvedValue(addedUser);
  //Using mockingoose
  mockingoose(userModel).toReturn(addedUser, 'save');

  const result = await userServices.addUser(toBeAdded);

  expect(result).toBeTruthy();
  expect(result.name).toBe(toBeAdded.name);
  expect(result.job).toBe(toBeAdded.job);
  expect(result).toHaveProperty("_id");

  //Following matchers only available if you jest mock lib
    // not available with mockingoose.
  // expect(userModel.save.mock.calls.length).toBe(1);
  // expect(userModel.save).toHaveBeenCalledWith(toBeAdded);
});

test("Adding user -- failure path with invalid id", async () => {
  const dummyUser = {
    _id: "123",
    name: "Harry Potter",
    job: "Young wizard",
  };

  mockingoose(userModel).toReturn(false, 'save');

  const result = await userServices.addUser(dummyUser);
  expect(result).toBeFalsy();
});

test("Adding user -- failure path with invalid job length", async () => {
  const dummyUser = {
    name: "Harry Potter",
    job: "Y",
  };

  mockingoose(userModel).toReturn(false, 'save');

  const result = await userServices.addUser(dummyUser);
  expect(result).toBeFalsy();
});

test("Adding user -- failure path with no job", async () => {
  const dummyUser = {
    name: "Harry Potter",
  };

  mockingoose(userModel).toReturn(false, 'save');

  const result = await userServices.addUser(dummyUser);
  expect(result).toBeFalsy();
});

test("Adding user -- failure path with no name", async () => {
  const dummyUser = {
    job: "Young wizard",
  };

  mockingoose(userModel).toReturn(false, 'save');

  const result = await userServices.addUser(dummyUser);
  expect(result).toBeFalsy();
});