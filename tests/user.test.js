//jshint esversion:9

const request = require("supertest");
const app = require("../src/index");
const User = require("../src/models/user");
const { userOneId, userOne, setupDatabase } = require("./fixtures/db");

beforeEach(setupDatabase);


test("Should signup a new user", async () => {
 const response = await request(app).post("/users").send({
  name: "modupe Omobolaji",
  email: "modupe@gmail.com",
  password: "mypass777"
 }).expect(201);
  
 //assert that a user is indeed created
 const user = await User.findById(response.body.userCreated._id);
 expect(user).not.toBeNull();

 //assert that a property in the created user exist
 expect(response.body).toMatchObject({
  userCreated: {
   name: "modupe Omobolaji",
   email: "modupe@gmail.com"
  },
  token: user.tokens[0].token
 });

 //assert that the plain password is not stored
 expect(user.password).not.toBe("mypass777");
});


test("Should login a user", async () => {
 const response = await request(app).post("/users/login").send({
  email: userOne.email,
  password: userOne.password
 }).expect(200);

 //assert that a user is found
 const user = await User.findById(response.body.user._id);
 expect(user).not.toBeNull();

 //assert that the currently token being used is the second token in the db
 expect(response.body.token).toBe(user.tokens[1].token); 
});

test("should not login non existing user", async () => {
 await request(app).post("/users/login").send({
  email: "nonexisting@example.com",
  password: "nonexisting"
 }).expect(400);
});

test("should view authenticated user profle", async () => {
 await request(app)
  .get("/users/me")
  .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
  .send()
  .expect(302);
});


test("Should not get profile for unauthenticated users", async () => {
 await request(app)
  .get("/users/me")
  .send()
  .expect(401);
});

test("Should delete account for Authenticated User", async () => {
 await request(app)
  .delete("/users/me")
  .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
  .send()
  .expect(200);
 
 const user = await User.findById(userOneId);
 expect(user).toBeNull();
});

test("should not delete account for unauthenticated user", async () => {
 await request(app)
  .delete("/users/me").send().expect(401);
});

test("should upload avatar for authenticated user", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(200);
  
  //Assert that the avatar exist in the Database
  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid user field", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "Arigbede Omobolaji Paul",
      age: 32
    })
    .expect(201);
    //Assert that the name is changed
  const user = await User.findById(userOneId);
  expect(user).toMatchObject({
    name: "Arigbede Omobolaji Paul",
    age: 32
  })
});

test("Should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: "Ogu, River State"
    })
    .expect(400);
});

test("should not signup user with invalid name email password", async () => {
  await request(app)
    .post("/users")
    .send({
      name: 123,
      email: "asss",
      password: "password"
    })
    .expect(400);
  const user = await User.findOne({
    name: 123,
    email: "asss",
    password: "password"
  });
  expect(user).toBeNull();
});

//should not update user if unauthenticated
test("should not update user if unauthenticated", async () => {
  const response = await request(app)
    .patch("/users/me")
    .send({
      name: "Adebanjo Sodiq",
      password: "mypass123"
    })
    .expect(401);
});