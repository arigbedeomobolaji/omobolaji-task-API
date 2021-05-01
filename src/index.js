//jshint esversion: 8

const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();

//Converting response from server to js object
app.use(express.json());
//Using the user router
app.use(userRouter);
// Using the task router
app.use(taskRouter);

module.exports = app;
