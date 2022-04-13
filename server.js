const database = require("./database");
const appModule = require("./app.js");
const port = 5000;

// appModule.app.connectDB();

database.connect()
    .then(conn => appModule.setDatabaseConn(conn))
    .catch(error => console.log(error));

appModule.app.listen(process.env.PORT || port, () => {
    console.log("REST API is listening.");
});