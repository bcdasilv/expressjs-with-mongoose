const mongoose = require("mongoose");
const UserSchema = require("./user");
const dotenv = require("dotenv");
dotenv.config();


let dbConnection;

function setConnection(newConn){
  dbConnection = newConn;
  return dbConnection;
}

function getDbConnection() {
  if (!dbConnection) {
    dbConnection = mongoose.createConnection(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
  }
  return dbConnection;
}

async function getUsers(name, job) {
  const userModel = getDbConnection().model("User", UserSchema);
  let result;
  if (name === undefined && job === undefined) {
    result = await userModel.find();
  } else if (name && job === undefined) {
    result = await findUserByName(name);
  } else if (job && name === undefined) {
    result = await findUserByJob(job);
  } else {
    result = await findUserByNameAndJob(name, job);
  }
  return result;
}

async function findUserById(id) {
  const userModel = getDbConnection().model("User", UserSchema);     
  try {
    return await userModel.findById(id);
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

async function addUser(user) {
  // userModel is a Model, a subclass of mongoose.Model
  const userModel = getDbConnection().model("User", UserSchema);
  try {
    const userToAdd = new userModel(user);
    const savedUser = await userToAdd.save();
    return savedUser;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function findUserByName(name) {
  const userModel = getDbConnection().model("User", UserSchema);       
  return await userModel.find({ name: name });
}

async function findUserByJob(job) {
  const userModel = getDbConnection().model("User", UserSchema);       
  return await userModel.find({ job: job });
}

module.exports = {
  getUsers,
  findUserById,
  addUser,
  setConnection
}
