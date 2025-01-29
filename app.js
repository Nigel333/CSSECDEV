const mysql = require("mysql2");
const express = require("express");
const path = require("path");
const hbs = require("hbs");
const exphbs = require("express-handlebars");
const session = require('express-session');
const app = express();

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Replace with your MySQL username
  password: "H@nter803", // Replace with your MySQL password
  database: "mydb", // Replace with your database name
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database.");
});

app.engine(
  "hbs",
  exphbs.engine({
    extname: "hbs",
    defaultLayout: "main", // This specifies the default layout
    layoutsDir: path.join(__dirname, "views/layouts"), // Path to the layouts folder
    helpers: {
      getUpvoteStatus: function (upvoteStatusArray, postId) {
        const status = upvoteStatusArray.find(item => item.post.post_id === postId);
        return status ? status.upvoteStatus : 0;
      },
      getDownvoteStatus: function (downvoteStatusArray, postId) {
        const status = downvoteStatusArray.find(item => item.post.post_id === postId);
        return status ? status.downvoteStatus : 0;
      },
      getSaveStatus: function (saveStatusArray, postId) {
        const status = saveStatusArray.find(item => item.post.post_id === postId);
        return status ? status.saveStatus : 0;
      },
      isEqual: function (a, b) {
        console.log(a, b);
        return a === b;
      },
    },
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Set up partials (optional)
hbs.registerPartials(path.join(__dirname, "views/partials"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/static", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'your-secret-key', // A secret key for signing the session ID
  resave: false, // Don't save session if unmodified
  saveUninitialized: true, // Save a session even if it's new
  cookie: { secure: false } // Set to `true` if you're using HTTPS (for security)
}));


const routes = require("./routes/route");

// Use the routes
app.use("/", routes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
