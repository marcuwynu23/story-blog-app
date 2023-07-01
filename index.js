require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const nunjucks = require("nunjucks");
const constants = require("./constants");
const mongoose = require("mongoose");
const logger = require("morgan");

const app = express();

nunjucks.configure(path.resolve(__dirname, "view"), {
  express: app,
  autoscape: true,
  noCache: false,
  watch: true,
});

app.use(logger("dev", {}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret of the star",
    saveUninitialized: false,
    resave: false,
  })
);
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const StorySchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
  },
  author: String,
  tags: String,
  content: String,
});
const Story = mongoose.model("Story", StorySchema);

app.get("/", (req, res) => {
  return res.render("index.html", {
    context: {
      title: constants.TITLE,
    },
  });
});

app.get("/story", async (req, res) => {
  try {
    const stories = await Story.find({});
    return res.render("stories.html", {
      context: {
        title: constants.TITLE,
        stories: stories,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.json({
      message: "Internal Server Error.",
    });
  }
});

app.get("/story/show/:id", async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id });
    console.log(story);
    return res.render("story-content.html", {
      context: {
        title: constants.TITLE,
      },
      story: story,
    });
  } catch (error) {
    console.error(error.message);
    return res.json({
      message: "Internal Server Error.",
    });
  }
});

app.get("/story/create", (req, res) => {
  try {
    return res.render("story-form.html", {
      context: {
        title: constants.TITLE,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.json({
      message: "Internal Server Error.",
    });
  }
});

app.post("/story/store", async (req, res) => {
  try {
    const createStore = await Story.create(req.body);
    console.log(createStore);
    return res.redirect("/story");
  } catch (error) {
    console.error(error.message);
    return res.json({
      message: "Internal Server Error.",
    });
  }
});

app.get("/story/edit/:id", async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id });
    return res.render("story-update-form.html", {
      context: {
        title: constants.TITLE,
      },
      story: story,
    });
  } catch (error) {
    console.error(error.message);
    return res.json({
      message: "Internal Server Error.",
    });
  }
});

app.post("/story/update/:id", async (req, res) => {
  try {
    const updateStory = await Story.updateOne(
      { _id: req.params.id },
      {
        title: req.body.title,
        author: req.body.author,
        tags: req.body.tags,
        content: req.body.content,
      }
    );
    return res.redirect("/story");
  } catch (error) {
    console.error(error.message);
    return res.json({
      message: "Internal Server Error.",
    });
  }
});

app.get("/story/remove/:id", async (req, res) => {
  try {
    const removeStory = await Story.deleteOne({ _id: req.params.id });
    return res.redirect("/story");
  } catch (error) {
    console.error(error.message);
    return res.json({
      message: "Internal Server Error.",
    });
  }
});

const PORT = 9000;
app.listen(process.env.PORT || PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Running Server on ${PORT}...`);
  }
});
