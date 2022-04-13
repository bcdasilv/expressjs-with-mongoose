const mongoose = require("mongoose");

let conn;

async function connect() {
    conn = await mongoose.createConnection(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    // console.log("Connected to db.");
    return conn;
}

async function disconnect() {
   await conn.close();        
}

module.exports = { connect, disconnect };