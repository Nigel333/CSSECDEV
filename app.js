const mysql = require("mysql2");
const express = require("express");
const path = require("path");
const hbs = require("hbs");
const exphbs = require("express-handlebars");
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

// Set the view engine to Handlebars
app.engine(
  "hbs",
  exphbs.engine({
    extname: "hbs",
    defaultLayout: "main", // This specifies the default layout
    layoutsDir: path.join(__dirname, "views/layouts"), // Path to the layouts folder
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

const routes = require("./routes/route");

// Use the routes
app.use("/", routes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
