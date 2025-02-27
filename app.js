require("dotenv").config();
const mysql = require("mysql2");
const express = require("express");
const path = require("path");
const hbs = require("hbs");
const exphbs = require("express-handlebars");
const session = require('express-session');
const app = express();
const MySQLStore = require("express-mysql-session")(session);
const fs = require("fs");
const https = require("https");


const options = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem"),
};


https.createServer(options, app).listen(3000, () => {
  console.log("HTTPS Server running on https://localhost:3000");
});

// MySQL Database Connection
// change the .env file as well! IMPORTANT
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER, // Replace with your MySQL username
  password: process.env.DB_PASSWORD, // Replace with your MySQL password
  database: process.env.DB_NAME, // Replace with your database name
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database.");
});

app.engine(
  "hbs",
  exphbs.engine({
    extname: "hbs",
    defaultLayout: "main", 
    layoutsDir: path.join(__dirname, "views/layouts"), 
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
        //console.log(a, b);
        return a === b;
      },
      printsmth: function (a) {
        console.log(a);
      },
    },
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

hbs.registerPartials(path.join(__dirname, "views/partials"));

app.use(express.static(path.join(__dirname, "public")));
app.use("/static", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionStore = new MySQLStore({}, db);

app.use(
  session({
    secret: process.env.SESSION_SECRET,  
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { 
      maxAge: 10 * 60 * 1000, 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  })
);

app.use((req, res, next) => {
  if (req.session.currentUser) {
    req.session._garbage = Date();
    req.session.touch();
  }
  next();
});

app.get("/check-session", (req, res) => {
  if (!req.session.currentUser) {
    return res.json({ sessionExpired: true });
  }
  res.json({ sessionExpired: false });
});

app.use((err, req, res, next) => {
  const debugMode = process.env.DEBUG === "true";

  if (debugMode) {
    return res.status(500).json({ stack: err.stack });
  }

  res.status(500).send("ERROR: Something went wrong, please try again." );
});



const routes = require("./routes/route");

// Use the routes
app.use("/", routes);

/* old HTTP server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
*/
