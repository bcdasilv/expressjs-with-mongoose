const mongoose = require("mongoose");
const UserSchema = require("./user");
const process = require("process");
const dotenv = require("dotenv");
dotenv.config();

let conn;

function setConnection(newConn) {
  return (conn = newConn);
}

function getConnection() {
  if (!conn) {
    conn = mongoose.createConnection(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(conn);
  }
  return conn;
}

async function getUsers(name, job) {
  const userModel = getConnection().model("User", UserSchema);
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
  const userModel = getConnection().model("User", UserSchema);
  try {
    return await userModel.findById(id);
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

async function addUser(user) {
  const userModel = getConnection().model("User", UserSchema);
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
  const userModel = getConnection().model("User", UserSchema);
  return await userModel.find({ name: name });
}

async function findUserByJob(job) {
  const userModel = getConnection().model("User", UserSchema);
  return await userModel.find({ job: job });
}

async function findUserByNameAndJob(name, job) {
  const userModel = getConnection().model("User", UserSchema);
  return await userModel.find({ name: name, job: job });
}

exports.getUsers = getUsers;
exports.findUserById = findUserById;
exports.addUser = addUser;
exports.setConnection = setConnection;
