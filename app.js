const Joi = require("joi");
const express = require("express");
const app = express();
const logger = require("./logger");
const helmet = require("helmet");
const morgan = require("morgan");

app.use(express.json());
app.use(express.urlencoded());
app.use(logger);
app.use(helmet());
app.use(morgan("tiny"));

app.use(function (req, res, next) {
  console.log("Authenticating...");
  next();
});

const courses = [
  { id: 1, name: "course1" },
  { id: 2, name: "course2" },
  { id: 3, name: "course3" },
];

app.get("/", (req, res) => {
  res.send("Hello world!!!");
});

app.get("/api/courses", (req, res) => {
  res.send(courses);
});

app.post("/api/courses", (req, res) => {
  const { error } = validateCourse(req.body);
  if (error) {
    // 400 Bad Request
    res.status(400).send(error.details[0].message);
    return;
  }

  const course = {
    id: courses.length + 1,
    name: req.body.name,
  };
  courses.push(course);
  res.send(course);
});

app.get("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course) {
    res.status(404).send("The course with the given ID was not found.");
  }
  res.send(course);
});

app.put("/api/courses/:id", (req, res) => {
  // Look up the course
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  // if not existing, return 404
  if (!course) {
    res.status(404).send("The course with the given ID was not found.");
  }

  // Validate
  // if invalid, return 400 - Bad request
  const { error } = validateCourse(req.body);
  if (error) {
    // 400 Bad Request
    res.status(400).send(error.details[0].message);
    return;
  }

  // Update course
  course.name = req.body.name;
  // Return the updated course
  res.send(course);
});

function validateCourse(course) {
  const schema = {
    name: Joi.string().min(3).required(),
  };

  return Joi.ValidationErroralidate(course, schema);
}

app.delete("/api/courses/:id", (req, res) => {
  // Look up the course
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  // if not existing, return 404
  if (!course) {
    res.status(404).send("The course with the given ID was not found.");
  }
  // delete
  const index = courses.indexOf(course);
  courses.splice(index, 1);
  // return the same code
  res.send(course);
});

// PORT
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
