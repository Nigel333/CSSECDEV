// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// Define your routes
router.get("/", (req, res) => {
  res.render("signin", { 
    title: "Sign In",
    noLayout: true 
    });
});

router.post("/signinFunc", (req, res) => {
  const { username, password } = req.body;

  // Query the database to find the user
  const query = "SELECT * FROM user WHERE username = ?";
  db.query(query, [username], (err, results) => {
      if (err) {
          console.error("Error querying the database:", err);
          return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length > 0) {
          // User exists, compare passwords
          const user = results[0];
          bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) {
                  console.error("Error comparing passwords:", err);
                  return res.status(500).json({ error: "Internal server error" });
              }

              if (isMatch) {
                  return res.status(200).json({ message: "Login successful" });
              } else {
                  return res.status(401).json({ message: "Invalid username or password" });
              }
          });
      } else {
          // No user found
          return res.status(400).json({ success: false, message: "User not found! Please register first" });
      }
  });
});

// POST route for user registration
router.post('/registerFunc', async (req, res) => {
  try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
          return res.status(400).json({ message: 'Username and password are required.' });
      }

      // Check if the username already exists
      const [existingUser] = await db.promise().query(
          'SELECT * FROM user WHERE username = ?',
          [username]
      );

      if (existingUser.length > 0) {
          return res.status(500).json({ message: 'Username already exists. Please choose another one.' });
      }

      // Hash the password before storing it in the database
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into the database
      const [result] = await db.promise().query(
          'INSERT INTO user (username, password) VALUES (?, ?)',
          [username, hashedPassword]
      );
      
      // Respond with success message
      return res.status(200).json({
          message: 'User registered successfully.',
          userId: result.insertId, // Send back the new user's ID
      });
  } catch (error) {
      console.error('Error registering user:', error);
      return res.status(400).json({ message: 'An error occurred while registering the user.' });
  }
});

router.get("/home", (req, res) => {
  res.render("index", { 
    title: "Home", 
    });
});

// Fetch all users
router.get("/users", (req, res) => {
  const query = "SELECT * FROM user";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).send("Error fetching users");
    }
    res.render("users", { title: "Users", users: results });
  });
});

router.get('/signin', (req, res) => {
  res.render('signin', {
    noLayout: true
  });
});

router.get('/register', (req, res) => {
  res.render('register', {
    noLayout: true
  });
});

router.get("/profile", (req, res) => {
  res.render("profile", { title: "User Profile", message: "Welcome to your profile" });
});

router.get('/polls', async (req, res) => {
  res.render('polls', {
    title: 'Polls',
    
  });
});

router.get('/games', async (req, res) => {
  res.render('games', {
    title: 'Games',
    
  });
});

router.get('/anime', async (req, res) => {
  res.render('anime', {
    title: 'Anime',
    
  });
});

// This route renders the policy page
router.get('/policy', async (req, res) => {
  res.render('policy', {
    title: 'Privacy Policy'
  });
});
// This route renders the wip page
router.get('/wip', async (req, res) => {
  res.render('wip', {
    title: 'Work in Progress'
  });
});
// Export the router
module.exports = router;
