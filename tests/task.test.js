//jshint esversion: 9

const request = require("supertest");
const app = require("../src/index");
const { userOneId, taskOneId, userOne, userTwo, taskOne, setupDatabase } = require("./fixtures/db");
const Task = require("../src/models/task");

beforeEach(setupDatabase);

test("Create a new Task ", async () => {
 const response = await request(app)
  .post("/tasks")
  .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
  .send({
   description: "testing the task model"
  })
  .expect(201);
 
  //Assert that the task is indeed created
 const task = await Task.findById(response.body._id);
 expect(task.completed).toEqual(false);
});

test("should list all task created by userOne", async () => {
 const response = await request(app)
  .get("/tasks/me")
  .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
  .send()
  .expect(302);
  //assert that it returns all task created by userOne
 expect(response.body.tasks.length).toEqual(response.body.length);
});

test("should not delete other user task", async () => {
 const response = await request(app)
  .delete(`/tasks/me/${taskOneId}`)
  .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
  .send()
  .expect(404);
 
 const task = await Task.findById(taskOneId);
 expect(task).not.toBeNull();
});

//should fetch only completed tasks
test("should fetch only completed tasks", async () => {
 const response = await request(app)
  .get("/tasks/me?completed=true")
  .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
  .send()
  .expect(302);
});

//should sort tasks by description/completed/created
test("should sort tasks by description", async () => {
 const response = await request(app)
  .get("/tasks/me?sortBy=description:asc")
  .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
  .send()
  .expect(302);
});

test("should sort tasks by completed", async () => {
 const response = await request(app)
  .get("/tasks/me?sortBy=completed:asc")
  .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
  .send()
  .expect(302);
 });

 test("should sort tasks by createdAt", async () => {
  const response = await request(app)
  .get("/tasks/me?sortBy=createdAt:desc")
  .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
  .send()
  .expect(302);
 });

 test("should sort tasks by description and completed", async () => {
  const response = await request(app)
  .get("/tasks/me?sortBy=description:asc:completed:asc")
  .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
  .send()
   .expect(302);
  console.log(response.body);
});
// More Testing
//links.mead.io/extratests
