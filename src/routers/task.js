//jshint esversion: 9

const express = require("express");
const Task = require("../models/task");
const auth = require("../middlewares/auth");
const router = new express.Router();

router.post("/tasks", auth, async (req, res) => {
 try {
  const task = new Task({
   ...req.body,
   author: req.user.email,
   owner: req.user._id
  });
  await task.save();
  res.status(201).send(task);
 } catch (e) {
  res.status(400).send("Bad Request ===> " + e.message);
 }

});

router.get("/tasks/me", auth, async (req, res) => {
 const match = {};
 const sort = {};
 let sortBy = req.query.sortBy;
  if (req.query.completed) {
   match.completed = req.query.completed === "true";
  }
  
 if (sortBy) {
   const parts = sortBy.split(":");
   if (parts.length < 3) {
     sort[parts[0]] = parts[1].toLowerCase() === "asc"? 1: -1;
    } else {
      for (let i = 0; i < parts.length; i += 2){
       sort[parts[i]] = parts[i+1].toLowerCase() === "asc"? 1: -1;
      }
    }
  }
  
 try {
  await req.user.populate({
   path: "myTasks",
   match,
   options: {
    limit: parseInt(req.query.limit),
    skip: parseInt(req.query.skip),
    sort
   }
  }).execPopulate();

  if (!req.user.myTasks) {
   return res.status(404).send("You haven't created any task");
  }

  res.status(302).send({length: req.user.myTasks.length, tasks: req.user.myTasks});
 } catch (e) {
  res.status(500).send(e.message);
 }
});


router.get("/tasks/:id", auth,  async (req, res) => {
 const _id = req.params.id;
 try {
  //const task = await Task.findById(_id);
  const task = await Task.findOne({ _id, owner: req.user._id });

  if (!task) {
   return res.status(404).send("search not found. Please Try another!");
  }
  res.status(302).send(task);
 }catch (e){
  res.status(500).send(e.message);
 }

});

router.patch("/tasks/:id", auth, async (req, res) => {
 const allowedFields = ["description", "completed"];
 const userEnteredFields = Object.keys(req.body);
 const isAllowed = userEnteredFields.every((field) => allowedFields.includes(field));

 if (!isAllowed) {
  return res.status(400).send("Error: Allowed fields are decription and completed.");
 }

 try {
  const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
  
  if (!task) {
   return res.status(404).send("Task not found");
  }

  userEnteredFields.forEach((field) => task[field] = req.body[field]);

  await task.save();

  res.status(200).send({message: "Task Was succesfully Updated", task});
 } catch (e) {
  res.status(500).send(e.message);
 }
});

router.delete("/tasks/:id", auth, async (req, res) => {
 try {
  const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
  
  if (!task) {
   return res.status(404).send("Task Not Found");
  }
  res.send("Task Succesfully Deleted");
 } catch (e) {
  res.status(500).send(e.message);
 }
});

module.exports = router;