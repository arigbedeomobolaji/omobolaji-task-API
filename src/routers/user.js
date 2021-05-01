// jshint esversion: 6
//jshint esversion: 8

const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/user");
const auth = require("../middlewares/auth");
const { sendWelcomeMsg, sendCancellationMsg } = require("../emails/account");
const router = new express.Router();

router.post("/users", async (req, res) => {
 const user = new User(req.body);

 try {
   const userCreated = await user.save();
   sendWelcomeMsg(user);
  const token = await userCreated.generateAuthToken();
  res.status(201).send({userCreated, token});
 } catch (e) {
  res.status(400).send("Bad Request ===> " + e.message);
 }

});

router.post("/users/login", async (req, res) => {
 try{
  const user = await User.findByCredentials(req.body.email, req.body.password);
  const token = await user.generateAuthToken();

  res.send({user, token});
 }catch(e){
  res.status(400).send(e.message);
 }
});

//Logout user on a particular system
router.post("/users/logout", auth, async (req, res) => {
 try {
  req.user.tokens = req.user.tokens.filter((token) => {
   return token.token !== req.token;
  });
  await req.user.save();
  res.send().send();
 } catch (e) {
  res.status(500).send();
 }
});

//Logout user all all devices

router.post("/users/logoutall", auth, async (req, res) => {
 try{
  req.user.tokens = [];
  await req.user.save();
  res.send("You have successfully logged out of all devices");
 } catch (e){
  res.status(500).send();
 }
});

//Read user profile after they are authorized to login
router.get("/users/me", auth, async (req, res) => {

 try {
   const user = req.user;
  res.status(302).send(user);
 } catch (e) {
  res.status(500).send(e);
 }
 
});

router.get("/users/:id", async (req, res) => {
 const _id = req.params.id;

 try {
  const user = await User.findById(_id);
  if (!user) {
   return res.status(404).send("No User found");
  }
  res.status(302).send(user);
  
 } catch (e) {
  res.status(500).send(e.message);
 }

});


router.patch("/users/me", auth, async (req, res) => {
 const allowedFields = ["name", "email", "password", "age"];
 const userEnteredFields = Object.keys(req.body);
 const isAllowed = userEnteredFields.every((field) => allowedFields.includes(field));
 if (!isAllowed) {
  return res.status(400).send("only name, email, password, and age fields are allowed");
 }
 try {
  userEnteredFields.forEach((field) => req.user[field] = req.body[field]);

  await req.user.save();
  res.status(201).send(req.user);
 } catch (e) {
  res.status(500).send(e.message);
 }
});

router.delete("/users/me", auth, async (req, res) => {
 try {
   const user = await req.user.remove();
   sendCancellationMsg(user);
  res.send({message: "User was successfully deleted", user});
 } catch (e) {
  res.status(500).send(e.message);
 }
});

const profilePics = multer({
 limits: {
  fileSize: 1000000
 },

 fileFilter(req, file, cb) {
  if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
   return cb(new Error("Please provide an image"));
  }
  cb(undefined, true);
 }
});

router.post("/users/me/avatar", auth, profilePics.single("avatar"), async (req, res) => {
  try {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send();
 }catch(e) {
  res.status(404).send({error: e.message});
 }
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message });
});

router.delete("/users/me/avatar", auth, async (req, res) => {
 try {
  req.user.avatar = undefined;
  await req.user.save();
  res.send("User profile pics successfully deleted");
 }catch (e) {
  res.status(500).send({ error: e.message });
 }
});

router.get("/users/me/avatar", auth, async (req, res) => {
  const avatar = req.user.avatar;
  if (!avatar) {
    throw new Error();
  }

  res.set("content-Type", "image/png");
  res.send(req.user.avatar);
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
  
    if (!user && !user.avatar) {
      throw new Error();
    }
    res.set("content-Type", "image/jpeg");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;