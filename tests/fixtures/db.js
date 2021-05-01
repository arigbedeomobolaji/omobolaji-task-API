//jshint esversion: 9

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/user");
const Task = require("../../src/models/task");


const userOneId = new mongoose.Types.ObjectId();
const userOne = {
 _id: userOneId,
 name: "Omobolaji",
 email: "omobolaji@example.com",
 password: "mypass1234!",
 age: 18,
 tokens: [{
  token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET_KEY)
 }]
};


const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
 _id: userTwoId,
 name: "Modupe",
 email: "modupe@example.com",
 password: "mypetis@#",
 age: 21,
 tokens: [{
  token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET_KEY)
 }]
};

const taskOneId = new mongoose.Types.ObjectId();
const taskOne = {
 _id: taskOneId,
 description: "First task",
 completed: true,
 owner: userOneId
};


const taskTwoId = new mongoose.Types.ObjectId();
const taskTwo = {
 _id: taskTwoId,
 description: "Second task",
 completed: false,
 owner: userOneId
};

const taskThreeId = new mongoose.Types.ObjectId();
const taskThree = {
 _id: taskThreeId,
 description: "Third task",
 completed: true,
 owner: userTwoId
};

const taskFourId = new mongoose.Types.ObjectId();
const taskFour = {
 _id: taskFourId,
 description: "Second task",
 completed: true,
 owner: userOneId
};

const setupDatabase = async () => {
 await User.deleteMany();
 await Task.deleteMany();
 await new User(userOne).save();
 await new User(userTwo).save();
 await new Task(taskOne).save();
 await new Task(taskTwo).save();
 await new Task(taskThree).save();
 await new Task(taskFour).save();
}

module.exports = {
 userOneId,
 taskOneId,
 userOne,
 userTwo,
 taskOne,
 setupDatabase
}