// const mongoose = require("mongoose");
const UserSchema = require("./user");
const dotenv = require("dotenv");
dotenv.config();

// Empty connection. 
// Use setDataBaseConn() to inject an actuall connection
let conn;

function setDataBaseConn(c) {
  conn = c;
}

async function getUsers(name, job) {
  const userModel = conn.model("User", UserSchema);
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
  const userModel = conn.model("User", UserSchema);     
  try {
    return await userModel.findById(id);
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

async function addUser(user) {
  const userModel = conn.model("User", UserSchema);
  try {
    const userToAdd = new userModel(user);
    const savedUser = await userToAdd.save();
    return savedUser;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function deleteUser(id) {
  const userModel = conn.model("User", UserSchema);
  try {
    return await userModel.findOneAndDelete({ _id: id });
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function findUserByName(name) {
  const userModel = conn.model("User", UserSchema);       
  return await userModel.find({ name: name });
}

async function findUserByJob(job) {
  const userModel = conn.model("User", UserSchema);       
  return await userModel.find({ job: job });
}

module.exports = {
  getUsers,
  findUserById,
  addUser,
  deleteUser,
  setDataBaseConn
}
