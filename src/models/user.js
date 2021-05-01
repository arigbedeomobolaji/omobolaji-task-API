//jshint esversion: 9

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");


const userSchema = new mongoose.Schema({
 name: {
  type: String,
  required: true,
  trim: true
 },
 email: {
  type: String,
  unique: true,
  required: true,
  trim: true,
  lowercase: true,
  validate(value) {
   if (!validator.isEmail(value)) {
    throw new Error("Email must be a valid Email");
   }
  }
 },
 password: {
  type: String,
  required: true,
  minlength: 7,
  trim: true,
  validate(value) {
   if (value.toLowerCase().includes("password")) {
    throw new Error("Password must not contain password");
   }
  }
 },
 age: {
  type: Number,
  min: 9,
  validate(value) {
   if (value < 0) {
    throw new Error("Age must be greater than 0");
   }
  }
 },
 tokens: [{
  token: {
   type: String,
   required: true
  }
 }],
 avatar: {
  type: Buffer
 }
}, {
 timestamps: true
});

//Virtual helps us to create field (type) on the Schema which are not saved in the DB
userSchema.virtual("myTasks", {
 ref: "Task",
 //Localfield is the primary key that ref uses to connect to the user collection
 localField: "_id",
 //foreignField is the foreign key that the tasks collection is using to recognize the User Model
 foreignField: "owner"
});
//When working with methods on the schema the this keyword reference the current document.
// Statics methods are also called Model Method. Use Statics when you want to do dem same thing to all the users in a schema
// Methods on the schema are also called Instance method. use method when you want to do something to a user at a particular time
userSchema.methods.toJSON = function () {
 const user = this;
 const userObject = user.toObject();

 delete userObject.password;
 delete userObject.tokens;
 delete userObject.avatar;
 
 return userObject;
};

userSchema.methods.generateAuthToken = async function () {
 const user = this;
 const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET_KEY, {expiresIn: "1 day"});

 user.tokens = user.tokens.concat({ token });

 await user.save();

 return token;
}

//findingByUsersCredentials
userSchema.statics.findByCredentials = async (email, password) => {
 const user = await User.findOne({ email });

 if (!user) {
  throw new Error("Unable to login");
 }

 const isMatch = await bcrypt.compare(password, user.password);

 if (!isMatch) {
  throw new Error("Unable to login");
 }

 return user;
}

// Hashing a plain text password 
userSchema.pre("save", async function(next) {
 const user = this;
 if (user.isModified) {
  if(user.password.length < 20) user.password = await bcrypt.hash(user.password, 8);
 }
 next();
});

//Delete the user Task before the user us removed
userSchema.pre("remove", async function (next) {
 const user = this;

 await Task.deleteMany({ owner: user._id }); 

 //next() tells the mongoose middleware that we are done with the function
 next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;