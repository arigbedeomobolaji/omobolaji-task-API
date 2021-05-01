//jshint esversion: 9

const mongoose = require("mongoose");
//Loading in the User model so that ref can make use of it.
const User = require("./user");

const taskSchema = mongoose.Schema({
 description: {
  type: String,
  required: true,
  trim: true,
 },
 completed: {
  type: Boolean,
  default: false
 },
 author: {
  type: String,
  require: true,
  ref: "User"
 },
 owner: {
  //This Mongoose.Sch..... helps us to make sure that the ObjectId is returned
  type: mongoose.Schema.Types.ObjectId,
  require: true,
  //This ref property helps us to relate with the User model
  ref: "User"
 }
}, {
 timestamps: true
})

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;