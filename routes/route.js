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
                  req.session.currentUser = user;
                  console.log(req.session.currentUser);
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

      // ADD SECURITY HERE



      

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

router.get("/home", async (req, res) => {
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
router.get("/view/:post_id", async (req, res) => {
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
router.post("/post", async (req, res) => {
  try {
    const { title, content, image } = req.body;
    const currentUser = req.session.currentUser; // Ensure the session contains the current user info

    if (!currentUser || !currentUser.user_id) {
      return res.status(401).json({ error: "Unauthorized" });
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

      console.log("New post inserted with post_id:", result.insertId);

      // Update the user's post count (if necessary)
      const updateUserQuery = `
        UPDATE user 
        SET postsMade = postsMade + 1
        WHERE user_id = ?;
      `;

      await db.promise().query(updateUserQuery, [currentUser.user_id]);

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

router.get("/main-profile", async (req, res) => {
  try {
    const filters = ['Posts', 'Comments', 'Upvoted', 'Downvoted', 'Saved'];
    const currentUsername = req.session.currentUser.username;

    const result = await db.execute(
      `SELECT user_id, username, profile_pic, bio FROM user WHERE username = ?`,
      [currentUsername]
    );
    
    console.log("DB Query Result:", result);
    
    // Fetch user details
    const [user] = await db.execute(
      `SELECT user_id, username, profile_pic, bio FROM user WHERE username = ?`,
      [currentUsername]
    );

    if (!user || user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = user[0].user_id;

    // Fetch user's posts
    const [postsMade] = await db.execute(
      `SELECT p.post_id, p.title, p.content, p.image, p.voteCtr, p.comCtr, u.username AS author 
       FROM post p 
       JOIN user u ON p.author = u.user_id
       WHERE p.author = ? 
       ORDER BY p.post_id DESC`, 
      [userId]
    ) || [];

    // Fetch user's comments
    const [comments] = await db.execute(
      `SELECT c.comment_id, c.content, c.parent_post, u.username AS author, p.title AS post_title
       FROM comment c
       JOIN user u ON c.author = u.user_id
       JOIN post p ON c.parent_post = p.post_id
       WHERE c.author = ? 
       ORDER BY c.comment_id DESC`,
      [userId]
    ) || [];

    // Fetch upvoted posts
    const [upvotedPosts] = await db.execute(
      `SELECT p.post_id, p.title, p.content, p.image, p.voteCtr, p.comCtr, u.username AS author 
       FROM post p 
       JOIN user u ON p.author = u.user_id
       JOIN upvote up ON up.post_id = p.post_id
       WHERE up.user_id = ?`,
      [userId]
    ) || [];

    // Fetch downvoted posts
    const [downvotedPosts] = await db.execute(
      `SELECT p.post_id, p.title, p.content, p.image, p.voteCtr, p.comCtr, u.username AS author 
       FROM post p 
       JOIN user u ON p.author = u.user_id
       JOIN downvote d ON d.post_id = p.post_id
       WHERE d.user_id = ?`,
      [userId]
    ) || [];

    // Fetch saved posts
    const [savedPosts] = await db.execute(
      `SELECT p.post_id, p.title, p.content, p.image, p.voteCtr, p.comCtr, u.username AS author 
       FROM post p 
       JOIN user u ON p.author = u.user_id
       JOIN saved s ON s.post_id = p.post_id
       WHERE s.user_id = ?`,
      [userId]
    ) || [];

    res.render("main-profile", {
      title: "My Profile",
      user: user[0],
      postsMade: postsMade,
      comments: comments,
      upvoted: upvotedPosts,
      downvoted: downvotedPosts,
      saved: savedPosts,
      filters: filters,
      currentUser: req.session.currentUser
    });
  } catch (error) {
    console.error("Error fetching profile data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
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
  req.session.destroy((err) => {
    if (err) {
        return res.status(500).json({ message: "Error logging out" });
    }
  });
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
