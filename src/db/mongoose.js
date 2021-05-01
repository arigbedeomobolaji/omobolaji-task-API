//jshint esversion: 6

const mongoose = require("mongoose");
//connect to database using mongoose
mongoose.connect(process.env.MONGODB_URL, {
 useUnifiedTopology: true,
 useCreateIndex: true,
 useNewUrlParser: true,
 useFindAndModify: false
});