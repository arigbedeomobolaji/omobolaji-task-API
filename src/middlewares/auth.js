//jshint esversion: 6
// jshint esversion: 9

const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
 try{
  const token = await req.header("Authorization").replace("Bearer ", "");
  const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = await User.findOne({_id: decoded._id, "tokens.token": token});
  if(!user){
   throw new Error("Please Authenticate");
  }
  req.token = token;
  req.user = user;
  next();
 }catch(e){
  res.status(401).send({error: "Please Authenticate"});
 }
}


module.exports = auth;