// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require("crypto");
const digitAvail = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
const uploadDir = path.join(__dirname, '..', 'public', 'images', 'profile');
const rateLimit = require("express-rate-limit");
const logger = require("./logger");


// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const username = req.body.username;
      cb(null, `${username}.png`);
    }
});

const upload = multer({ storage });

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { message: "Too many login attempts, please try again later." },
  standardHeaders: true, 
  legacyHeaders: false, 
})

const loginAttempts = {};

const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 15 * 60 * 1000; // 15 minutes



// ----------------------------------------- Functions
// generates characters aA-zZ, 0-9, and _- of length
function saltbae(length){
  var s =[];
  var digits = digitAvail;
  for (var i = 0; i < length; i++){
    s[i] = digits.substr(Math.floor(Math.random()*digits.length - 1), 1);
  }
  return s.join("");
}

// hash passwords
function hashbrown(password, salt, pepper){
  var hashbuff = crypto.pbkdf2Sync(password+pepper, salt, 10000, 64, 'sha512');
  return hashbuff.toString('hex').slice(0, 50);
}

//iterate through digits avail for pepper
function findPepperedPassword(password, salt, db){
  var pepper = "";
  for (var i = 0; i < digitAvail.length; i++){
    pepper = digitAvail.substr(i, 1);
    //console.log("Pepper: " + pepper+"  " + hashbrown(password, salt, pepper));
    if (hashbrown(password, salt, pepper) == db){
      //correct password
      return true;
    }
  }
  return false;
}

//check file type 
function checkValidFileType(file){
  //console.log(Buffer.isBuffer(file)); ANWER: NO
  //console.log(Buffer.isBuffer(file.buffer)); ANSWER: NO
  //console.log(file.path); note: file is.. a lot of things print without .path for details
  //allowed extensions
  const jpgMagic = Buffer.from([0xFF, 0xD8, 0xFF]); 
  const pngMagic = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]); 

  //check magic number
  const filebuff = fs.readFileSync(file.path);
  const isJPG = jpgMagic.equals(filebuff.slice(0, 3));
  const isPNG = pngMagic.equals(filebuff.slice(0, 8));

  return isJPG || isPNG;
}

function isValidEmail(email) {
  const regex = /^\w+@\w+\.\w+$/;
  return regex.test(email);
}

function isValidPhoneNumber(phone) {
  const regex = /^\+\d{12}$/;
  return regex.test(phone);
}


function trackFailedAttempts(req, res, next) {
  const ip = req.ip;

  if (!loginAttempts[ip]) {
    loginAttempts[ip] = { attempts: 0, lastAttempt: Date.now(), blockedUntil: null };
  }

  const data = loginAttempts[ip];

  // If IP is currently blocked
  if (data.blockedUntil && Date.now() < data.blockedUntil) {
    return res.status(400).json({ message: "Too many failed attempts. Try again later." });
  }

  // Reset attempts if last attempt was a long time ago
  if (Date.now() - data.lastAttempt > BLOCK_TIME) {
    data.attempts = 0;
  }

  data.lastAttempt = Date.now();
  next();
}

function sessionTimeoutMiddleware(req, res, next) {
  if (!req.session.currentUser) {
    return res.status(400).json({ message: "Session expired. Please log in again." });
  }
  next();
}

// -----------------------------------------

// All routes
router.get("/", async (req, res) => {

  res.render("signin", { 
    title: "Sign In",
    noLayout: true 
    });
});

router.post("/signinFunc", loginRateLimiter, trackFailedAttempts,  (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip;

  
  if (!loginAttempts[ip]) {
    loginAttempts[ip] = { attempts: 0, lastAttempt: Date.now(), blockedUntil: null };
  }
  // Query the database to find the user
  const query = "SELECT * FROM user WHERE username = ?";
  db.query(query, [username], (err, results) => {
      if (err) {
          logger.error(`Database error during login for user ${username}, IP: ${ip}: ${err.message}`);
          return res.status(500).json({ error: "username or password is incorrect!" });
      }

      if (results.length > 0) {
          // User exists, compare passwords
          const user = results[0];
          var asta = findPepperedPassword(password, user.salt, user.password);
          if(asta == false){
            logger.warn(`Failed login attempt for user ${username} from IP ${ip}`);
            loginAttempts[ip].attempts += 1;

            if (loginAttempts[ip].attempts >= MAX_ATTEMPTS) {
              logger.warn(`IP ${req.ip} temporarily blocked due to too many failed login attempts`);
              loginAttempts[ip].blockedUntil = Date.now() + BLOCK_TIME; 
              return res.status(429).json({ message: "Too many failed attempts. Try again later." });
            }
            // console.log(loginAttempts[ip].attempts);
            
            console.error("Error comparing passwords:", err);
            return res.status(500).json({ message: "username or password is incorrect!" });
          }
          if (asta == true) {
            logger.info(`User ${username} logged in successfully from IP ${req.ip}`);
            loginAttempts[ip] = { attempts: 0, lastAttempt: Date.now(), blockedUntil: null };
            req.session.currentUser = user;
            console.log(req.session.currentUser);
            //console.log("Session ID:", req.sessionID);
            //console.log("Session Data:", req.session);

            if (user.status == "admin") {
              return res.status(200).json({ message: "Admin" });
            } else {
            return res.status(200).json({ message: "Login successful" });
            }
          }

      } else {
          // No user found
          logger.warn(`Login attempt for non-existent user: ${username}`);
          return res.status(400).json({ success: false, message: "User not found! Please register first" });
      }
  });
});

// POST route for user registration
router.post('/registerFunc', upload.single('profilePic'),  async (req, res) => {
  try {
      const { username, password, email} = req.body;
      let phone = req.body.phone;

      if (phone.startsWith("09")) {
        phone = phone.substring(1);
        phone = "+63" + phone;
        if (isValidPhoneNumber(phone) == false){
          return res.status(400).json({ message: 'Invalid phone number. Please enter a valid phone number.'});
        }
      } else if (phone.startsWith("63")) {
        phone = "+" + phone;
        if (isValidPhoneNumber(phone) == false){
          return res.status(400).json({ message: 'Invalid phone number. Please enter a valid phone number.'});
        }
      } else if (phone.startsWith("+63")) {
        if (isValidPhoneNumber(phone) == false){
          return res.status(400).json({ message: 'Invalid phone number. Please enter a valid phone number.'});
        }
      } else {
        return res.status(400).json({ message: 'Invalid phone number. Please enter a valid phone number.'});
      }

      if (isValidEmail(email) == false){
        return res.status(400).json({ message: 'Invalid email address. Please enter a valid email address.'});
      }
      if (checkValidFileType(req.file) == false){
        return res.status(400).json({ message: 'Invalid file type. Please upload a valid image file.'});
      }
      

      const profilepic = `${username}.png`;
      // Validate input
      if (!username || !password || !email || !phone || !profilepic) {
          return res.status(400).json({ message: 'All fields are required.' });
      }

      // Check if the username already exists
      const [existingUser] = await db.promise().query(
          'SELECT * FROM user WHERE username = ?',
          [username]
      );

      if (existingUser.length > 0) {
          return res.status(500).json({ message: 'Username already exists. Please choose another one.' });
      }

      //salt
      var salt = saltbae(20);

      //pepper
      var pepper = saltbae(1);

      // Hash the password before storing it in the database
      const hashedPassword = await hashbrown(password, salt, pepper);
      
      //console.log('Temporary file path:', req.file.path);

      // Insert new user into the database
      const [result] = await db.promise().query(
          'INSERT INTO user (username, password, salt, email, phone_number, profile_pic) VALUES (?, ?, ?, ?, ?, ?)',
          [username, hashedPassword, salt, email, phone, profilepic]
      );
      
      // Respond with success message
      return res.status(200).json({
          message: 'User registered successfully.',
          userId: result.insertId, // Send back the new user's ID
      });
  } catch (error) {
      console.error('Error registering user:', error);
      return res.status(600).json({ message: 'An error occurred while registering the user.' });
  }
});

router.get("/home", sessionTimeoutMiddleware, async (req, res) => {
  try {
    // Fetch posts and their related data using JOINs
    const postsQuery = `
      SELECT 
        p.post_id, p.title, p.content, p.voteCtr, p.comCtr, 
        u.user_id AS author_id, u.username AS author_name,
        IF(l.post_id IS NOT NULL, 1, 0) AS upvoted,
        IF(d.post_id IS NOT NULL, 1, 0) AS downvoted,
        IF(s.post_id IS NOT NULL, 1, 0) AS saved
      FROM post p
      JOIN user u ON p.author = u.user_id
      LEFT JOIN likedBy l ON p.post_id = l.post_id AND l.user_id = ?
      LEFT JOIN dislikedBy d ON p.post_id = d.post_id AND d.user_id = ?
      LEFT JOIN madeBy s ON p.post_id = s.post_id AND s.user_id = ?
    `;
    const posts = await db.promise().query(postsQuery, [
      req.session.currentUser?.user_id || 0,
      req.session.currentUser?.user_id || 0,
      req.session.currentUser?.user_id || 0,
    ]);

    // Fetch users and calculate contributions
    const usersQuery = `
      SELECT 
        u.user_id, u.username, u.profile_pic, u.bio,
        COUNT(DISTINCT p.post_id) AS postsMade,
        COUNT(DISTINCT c.comment_id) AS commentsMade,
        COUNT(DISTINCT l.post_id) AS upvotedPosts,
        COUNT(DISTINCT d.post_id) AS downvotedPosts
      FROM user u
      LEFT JOIN post p ON u.user_id = p.author
      LEFT JOIN comment c ON u.user_id = c.author
      LEFT JOIN likedBy l ON u.user_id = l.user_id
      LEFT JOIN dislikedBy d ON u.user_id = d.user_id
      GROUP BY u.user_id
    `;
    const users = await db.promise().query(usersQuery);

    // Process posts to get sorted lists
    const upvoteStatusArray = posts[0].map(post => ({
      post: post,
      upvoteStatus: post.upvoted ? 1 : 0,
    }));
    const downvoteStatusArray = posts[0].map(post => ({
      post: post,
      downvoteStatus: post.downvoted ? 1 : 0,
    }));
    const saveStatusArray = posts[0].map(post => ({
      post: post,
      saveStatus: post.saved ? 1 : 0,
    }));

    // Sort posts and status arrays by voteCtr
    upvoteStatusArray.sort((a, b) => b.post.voteCtr - a.post.voteCtr);
    downvoteStatusArray.sort((a, b) => b.post.voteCtr - a.post.voteCtr);
    saveStatusArray.sort((a, b) => b.post.voteCtr - a.post.voteCtr);
    posts[0].sort((a, b) => b.voteCtr - a.voteCtr);

    // Process users to calculate contributions and get top 3
    const topUsers = users[0].map(user => ({
      ...user,
      contributions:
        (user.postsMade || 0) +
        (user.commentsMade || 0) +
        (user.upvotedPosts || 0) +
        (user.downvotedPosts || 0),
    }));
    topUsers.sort((a, b) => b.contributions - a.contributions);
    const top3Users = topUsers.slice(0, 3);
    console.log(top3Users);
    
    // Render the page with the fetched data
    res.render("index", {
      title: "Home",
      posts: posts[0],
      toppost: posts[0][0],
      topusers: top3Users,
      currentUser: req.session.currentUser,
      upvoteStatusArray,
      downvoteStatusArray,
      saveStatusArray,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// This route renders the view page.
router.get("/view/:post_id", sessionTimeoutMiddleware, async (req, res) => {
  try {
    const post_id = req.params.post_id;

    // Query to fetch the post details
    const postQuery = `
      SELECT 
        p.post_id, p.title, p.content, p.voteCtr, p.comCtr, 
        u.user_id AS author_id, u.username AS author_name, u.profile_pic AS author_pic,
        IF(l.post_id IS NOT NULL, 1, 0) AS upvoted,
        IF(d.post_id IS NOT NULL, 1, 0) AS downvoted,
        IF(s.post_id IS NOT NULL, 1, 0) AS saved
      FROM post p
      JOIN user u ON p.author = u.user_id
      LEFT JOIN likedBy l ON p.post_id = l.post_id AND l.user_id = ?
      LEFT JOIN dislikedBy d ON p.post_id = d.post_id AND d.user_id = ?
      LEFT JOIN madeBy s ON p.post_id = s.post_id AND s.user_id = ?
      WHERE p.post_id = ?;
    `;

    const postResult = await db.promise().query(postQuery, [
      req.session.currentUser?.user_id || 0,
      req.session.currentUser?.user_id || 0,
      req.session.currentUser?.user_id || 0,
      post_id,
    ]);
    const post = postResult[0][0];

    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Query to fetch the comments related to the post
    const commentsQuery = `
      SELECT 
        c.comment_id, c.content, c.reply AS is_reply, 
        c.parent_comment AS parent_id,
        u.user_id AS author_id, u.username AS author_name, u.profile_pic AS author_pic
      FROM comment c
      JOIN user u ON c.author = u.user_id
      WHERE c.parent_post = ?
      ORDER BY c.comment_id ASC;
    `;

    const commentsResult = await db.promise().query(commentsQuery, [post_id]);
    const comments = commentsResult[0];

    // Process comments if needed (e.g., threading or grouping replies)
    const threadedComments = comments.map(comment => ({
      ...comment,
      replies: comments.filter(reply => reply.parent_id === comment.comment_id),
    })).filter(comment => !comment.parent_id); // Keep only top-level comments

    // Render the view page
    res.render("view", {
      title: post.title,
      post: {
        ...post,
        comments: threadedComments,
      },
      currentUser: req.session.currentUser,
      upvoteStatus: post.upvoted,
      downvoteStatus: post.downvoted,
      saveStatus: post.saved,
    });
  } catch (error) {
    console.error("Error fetching post or comments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// This route is used for creating posts.
router.post("/post", sessionTimeoutMiddleware, async (req, res) => {
  try {
    const { title, content, image } = req.body;
    const currentUser = req.session.currentUser; // Ensure the session contains the current user info

    if (!currentUser || !currentUser.user_id) {
      return res.status(400).json({ error: "Unauthorized" });
    }

    if (title && content) {
      // Insert the new post into the database
      const insertPostQuery = `
        INSERT INTO post (title, content, image, author, voteCtr, comCtr) 
        VALUES (?, ?, ?, ?, 0, 0);
      `;

      const [result] = await db.promise().query(insertPostQuery, [
        title,
        content,
        image || null, // Handle the case where the image is optional
        currentUser.user_id,
      ]);

      logger.info(`New post inserted with post_id: ${result.insertId} by user ${currentUser.username}`);
      //console.log("New post inserted with post_id:", result.insertId);

      // Update the user's post count (if necessary)
      const insertMadeByQuery = `
        INSERT INTO madeby (user_id, post_id, comment_id) VALUES (?, ?, NULL);
      `;

      await db.promise().query(insertMadeByQuery, [currentUser.user_id, result.insertId]);

      // Respond with the new post's ID
      res.status(200).json({ post_id: result.insertId });
    } else {
      res.status(400).json({ error: "Title and content are required" });
    }
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// BROKEN for now
router.get("/main-profile", sessionTimeoutMiddleware, async (req, res) => {
  try {
    const filters = ['Posts', 'Comments', 'Upvoted', 'Downvoted', 'Saved'];
    const currentUser = req.session.currentUser

    const requestUserQuery = `
        SELECT * FROM user WHERE user_id = ?
        `;

    const [user] = await db.promise().query(requestUserQuery, [
      currentUser.user_id,
    ]);
    
    
    console.log("DB Query Result:", user);

    
    if (!user || user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const userId = user[0].user_id; // Access the first row (since it's an array of rows)
    console.log("User ID:", userId); // Logs the correct user ID
    
    // Fetch user's posts
    const requestPostsQuery = `
      SELECT p.post_id, p.title, p.content, p.image, p.voteCtr, p.comCtr, u.username AS author 
       FROM post p 
       JOIN user u ON p.author = u.user_id
       WHERE p.author = ? 
       ORDER BY p.post_id DESC
       `;
    const [postsMade] = await db.promise().query(requestPostsQuery, [userId]) || [];

    // Fetch user's comments
    const requestCommentsQuery = `
       SELECT c.comment_id, c.content, c.parent_post, u.username AS author, p.title AS post_title
       FROM comment c
       JOIN user u ON c.author = u.user_id
       JOIN post p ON c.parent_post = p.post_id
       WHERE c.author = ? 
       ORDER BY c.comment_id DESC
       `;
    
    const [comments] = await db.promise().query(requestCommentsQuery, [userId]) || [];

    // Fetch upvoted posts
    const requestUpvotedPostsQuery = `
       SELECT p.post_id, p.title, p.content, p.image, p.voteCtr, p.comCtr, u.username AS author 
       FROM post p 
       JOIN user u ON p.author = u.user_id
       JOIN likedby up ON up.post_id = p.post_id
       WHERE up.user_id = ?
      `;
   
    const [upvotedPosts] = await db.promise().query(requestUpvotedPostsQuery, [userId]) || [];

    // Fetch downvoted posts
    const requestDownvotedPostsQuery = `
       SELECT p.post_id, p.title, p.content, p.image, p.voteCtr, p.comCtr, u.username AS author 
       FROM post p 
       JOIN user u ON p.author = u.user_id
       JOIN dislikedby d ON d.post_id = p.post_id
       WHERE d.user_id = ?
       `;

    const [downvotedPosts] = await db.promise().query(requestDownvotedPostsQuery, [userId]) || [];
    
    /* Fetch saved posts
    const [savedPosts] = await db.execute(
      `SELECT p.post_id, p.title, p.content, p.image, p.voteCtr, p.comCtr, u.username AS author 
       FROM post p 
       JOIN user u ON p.author = u.user_id
       JOIN saved s ON s.post_id = p.post_id
       WHERE s.user_id = ?`,
      [userId]
    ) || [];

    */
    res.render("main-profile", {
      title: "My Profile",
      user: user[0],
      postsMade: postsMade,
      comments: comments,
      upvoted: upvotedPosts,
      downvoted: downvotedPosts,
      //saved: savedPosts,
      filters: filters,
      currentUser: req.session.currentUser
    });
  } catch (error) {
    console.error("Error fetching profile data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.put("/post/:post_id", sessionTimeoutMiddleware, async (req, res) => {
  try {
    const postIdToUpdate = parseInt(req.params.post_id);
    const { title, content, img } = req.body;

    // Check if the post exists
    const checkQuery = "SELECT * FROM post WHERE post_id = ?";
    db.query(checkQuery, [postIdToUpdate], (err, results) => {
      if (err) {
        logger.error(`Error checking post in database: ${err.message}`);
        //console.error("Error checking post:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (results.length === 0) {
        logger.warn(`Attempted to edit a non-existent post with ID: ${postIdToUpdate}`);
        return res.status(404).json({ error: "Post not found" });
      }

      // Update the post
      const updateQuery = `
        UPDATE post 
        SET title = ?, content = ?, image = ?
        WHERE post_id = ?
      `;

      db.query(updateQuery, [title, content, img, postIdToUpdate], (err, result) => {
        if (err) {
          logger.error(`Error updating post in database: ${err.message}`);
          //console.error("Error updating post:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        logger.info(`Post with ID ${postIdToUpdate} updated successfully by user ${req.session.currentUser.username}`);
        res.status(200).json({ message: "Post updated successfully", edited: true });
      });
    });
  } catch (error) {
    console.error("Error in update route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/post/:post_id", sessionTimeoutMiddleware, async (req, res) => {
  try {
    const postIdToDelete = parseInt(req.params.post_id);

    const deleteReferencesQuery = "DELETE FROM madeby WHERE post_id = ?";
    await db.promise().execute(deleteReferencesQuery, [postIdToDelete]);
    
    const deleteQuery = "DELETE FROM post WHERE post_id = ?";
    const [deleteResult] = await db.promise().execute(deleteQuery, [postIdToDelete]);

    if (deleteResult.affectedRows === 0) {
      logger.warn(`Attempted to delete a non-existent post with ID: ${postIdToDelete}`);
      return res.status(404).json({ error: "Post not found" });
    }

    logger.info(`Post with ID ${postIdToDelete} deleted successfully by user ${req.session.currentUser.username}`);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get('/signin', (req, res) => {
  if (req.session.currentUser) {
    logger.info(`User ${req.session.currentUser.username} logged out.`);
  }
  req.session.destroy((err) => {
    if (err) {
        return res.status(500).json({ message: "Error logging out" });
    } 
    res.clearCookie("connect.sid");
    
    res.render('signin', {
      noLayout: true
    });
  });  
});

router.get('/register', (req, res) => {
  res.render('register', {
    noLayout: true
  });
});

router.get('/admin', async(req, res) => {
  try {
    //fetch users
    const q = `
    SELECT
     u.user_id, u.username
    FROM user u
    `;
    // const userlist = await db.promise().query(q);
    const userlist = await db.promise().query(q, [
      req.session.currentUser?.user_id || 0,
      req.session.currentUser?.user_id || 0,
      req.session.currentUser?.user_id || 0, //WHAT IS THIS FOR? 
    ] );
  
    //console.log("User List:", userlist );
    
    res.render('admin', {
      title: 'Admin Panel',
      userlist: userlist[0],
    });
  }catch (error) {
    console.error("Error in admin fetch:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }  
  });
  
  //might need to change to /admin/:user_id
  router.delete("/admin/user/:user_id", sessionTimeoutMiddleware, async (req, res) => {
    try {
      const useridToDelete = parseInt(req.params.user_id);
      console.log("User ID to delete:", useridToDelete);
      
      
      const madeBydelete = `DELETE FROM madeby WHERE user_id = ?`;
      await db.promise().execute(madeBydelete, [useridToDelete]);

      // wipe from the face of the earth
      const postdelete = `DELETE FROM post WHERE author = ?`;
      await db.promise().execute(postdelete, [useridToDelete]);


      const commentdelete = `DELETE FROM comment WHERE author = ?`; 
      await db.promise().execute(commentdelete, [useridToDelete]);

      const userdelete = `DELETE FROM user WHERE user_id = ?`;
      await db.promise().execute(userdelete, [useridToDelete]);

      logger.info(`User ${useridToDelete} deleted successfully by admin`);
      res.status(200).json({ message: "user deleted successfully" });
      
    } catch (error){
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

router.get("/profile", (req, res) => {
  res.render("profile", { title: "User Profile", message: "Welcome to your profile" });
});

router.get('/featured', async (req, res) => {
  res.render('wip', {
    title: 'Featured',
  });

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
