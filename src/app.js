//jshint esversion: 8

const app = require("./index");

const port = process.env.PORT;

app.listen(port, () => {
 console.log('Server started on port: ' + port);
});