const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');
const supertest = require("supertest");
const appModule = require("../../app");
const database = require("../../database");

Given('the user name to be searched is \'Ted Lasso\'', async () => {
    this.userName = 'Ted Lasso';
    try {
        appModule.setDatabaseConn(await database.connect());
      }catch(error) {
        console.log(error);
      }
});

When('the search request is sent', async () => {
    this.response = await supertest(appModule.app)
    .get("/users?name="+this.userName);
});

Then('the result should be a list of user objects with name \'Ted Lasso\'', () => {
  assert.equal(this.response.status, 200);
  this.response.body.users_list.forEach(
      user => assert.equal(user.name, this.userName));
});