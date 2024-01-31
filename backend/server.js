require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const multer = require("multer");
const HOST = "localhost";
const PORTNO = 5432;
// Create a new express application
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");

app.use(express.json());
// Serve static files from the 'backend/imageUploaded' directory
app.use(
  "/uploaded-images",
  express.static(path.join(__dirname, "imageUploaded"))
);
// PostgreSQL connection configuration
const pool = new Pool({
  user: "interactwithmeadmin",
  host: HOST, // Adjust if your DB is hosted elsewhere
  database: "interactwithme",
  password: "interactwithmeadmin",
  port: PORTNO, // Default PostgreSQL port
});
function handleDatabaseError(error, res) {
  // Duplicate username
  if (error.code === "23505" && error.constraint === "users_username_key") {
    res.status(409).send({ message: "This username is already taken." });
  }
  // Other database errors
  else {
    console.error(error);
    res.status(500).send({ message: "An error occurred." });
  }
}
// Verify database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  console.log("Connected to PostgreSQL Database");
  release();
});
// Set up storage location and file naming
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "backend/imageUploaded"); // Your directory path
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });
// Define a test route
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while testing database");
  }
});
// Login route
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      const match = await bcrypt.compare(password, user.password);
      if (match) {
        // Include userId in the response
        res.json({
          success: true,
          message: "Login successful.",
          userId: user.id,
        });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Invalid credentials." });
      }
    } else {
      res.status(404).json({ success: false, message: "User not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred." });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Hash the password before storing it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, hashedPassword]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    handleDatabaseError(error, res);
  }
});
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, email FROM users");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred." });
  }
});

app.post(
  "/api/users/:userId/profile-picture",
  upload.single("file"),
  async (req, res) => {
    try {
      const userId = req.params.userId;
      // Get the file path from multer's req.file
      const profilePicturePath = req.file.path;

      const result = await pool.query(
        "UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING *",
        [profilePicturePath, userId]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      handleDatabaseError(error, res);
    }
  }
);
/** */
app.post(
  "/api/users/:submissionId/uploaded-item",
  upload.single("file"),
  async (req, res) => {
    try {
      const submissionId = req.params.submissionId;
      const postingUserId = req.body.userId; // Extract the posting_user_id from the request body
      const uploadedFilePath = path.join(
        "/uploaded-images",
        path.basename(req.file.path)
      ); // Store only the relative path

      // Insert into the submission_dialog table
      const result = await pool.query(
        "INSERT INTO submission_dialog (submission_id, posting_user_id, uploaded_path) VALUES ($1, $2, $3) RETURNING *",
        [submissionId, postingUserId, uploadedFilePath]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      handleDatabaseError(error, res);
    }
  }
);

app.get("/api/users/:submissionId/posts", async (req, res) => {
  try {
    const submissionId = req.params.submissionId;

    // New query to fetch from the submission_dialog table
    const query = `
    SELECT 
    sd.id, 
    sd.submission_id, 
    sd.posting_user_id, 
    sd.text_content AS content,
    sd.uploaded_path, 
    sd.created_at,
    u.username,
    CASE 
        WHEN sd.uploaded_path IS NULL THEN 'text' 
        ELSE 'media' 
    END AS type 
FROM 
    submission_dialog sd
JOIN 
    users u ON sd.posting_user_id = u.id
WHERE 
    sd.submission_id = $1
ORDER BY 
    sd.created_at DESC;
    `;

    const result = await pool.query(query, [submissionId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error occurred while fetching posts.");
  }
});
app.post("/api/update-the-group", async (req, res) => {
  try {
    const { submissionId, userIds } = req.body; // Get submissionId and userIds from request body

    // Begin a transaction
    await pool.query('BEGIN');

    // Delete all existing members (except the creator) from the group
    await pool.query(
      "DELETE FROM submission_members WHERE submission_id = $1 AND participating_user_id != (SELECT user_id FROM user_submissions WHERE id = $1)",
      [submissionId]
    );

    // Insert the new set of members
    for (const userId of userIds) {
      await pool.query(
        "INSERT INTO submission_members (submission_id, participating_user_id) VALUES ($1, $2)",
        [submissionId, userId]
      );
    }

    // Commit the transaction
    await pool.query('COMMIT');

    res.send({ message: "Group updated successfully." });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    res.status(500).send({ message: "An error occurred while updating the group." });
  }
});

app.get("/api/my_interaction_titles", async (req, res) => {
  try {
    const loggedInId = req.query.logged_in_id; // Get the logged-in user's ID from the query parameters

    if (!loggedInId) {
      return res.status(400).send({ message: "Logged in ID is required." });
    }

    const query = `
      SELECT 
        us.id AS submission_id, 
        us.title, 
        TO_CHAR(us.created_at, 'Day, DD Month YYYY HH24:MI') AS formatted_created_at,
        us.user_id, 
        u.username
      FROM 
        submission_members sm
      JOIN 
        user_submissions us ON sm.submission_id = us.id
      JOIN 
        users u ON us.user_id = u.id
      WHERE 
        sm.participating_user_id = $1;
    `;

    const result = await pool.query(query, [loggedInId]); // Execute the query with the logged-in user's ID
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({
        message: "An error occurred while fetching interaction titles.",
      });
  }
});
app.get("/api/interaction_user_list", async (req, res) => {
  try {
    const submissionId = req.query.submission_id; // Get the submission ID from the query parameters

    if (!submissionId) {
      return res.status(400).send({ message: "Submission ID is required." });
    }

    const query = `
      SELECT 
        u.id, 
        u.username,
        us.title
      FROM 
        submission_members sm
      JOIN 
        users u ON sm.participating_user_id = u.id
      JOIN 
        user_submissions us ON sm.submission_id = us.id
      WHERE 
        sm.submission_id = $1 AND
        sm.participating_user_id != us.user_id;
    `;

    const result = await pool.query(query, [submissionId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({
        message: "An error occurred while fetching user list for the interaction.",
      });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, username, email, profile_picture FROM users WHERE id = $1",
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred." });
  }
});

app.post("/api/users/:submissionId/text-entry", async (req, res) => {
  try {
    const submissionId = req.params.submissionId;
    const { userId, textContent } = req.body; // Extracting userId and textContent from the request body

    // Validate the received data
    if (!userId || !textContent) {
      return res
        .status(400)
        .json({ message: "User ID and text content are required." });
    }

    // Insert into the submission_dialog table
    const result = await pool.query(
      "INSERT INTO submission_dialog (submission_id, posting_user_id, text_content) VALUES ($1, $2, $3) RETURNING *",
      [submissionId, userId, textContent]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    handleDatabaseError(error, res);
  }
});

app.post("/api/user_submissions", async (req, res) => {
  try {
    const { user_id, title, userIds } = req.body;

    if (!user_id || !title || !userIds || !Array.isArray(userIds)) {
      return res
        .status(400)
        .json({ message: "User ID, title, and userIds are required." });
    }

    // Insert into user_submissions table
    const submissionResult = await pool.query(
      "INSERT INTO user_submissions (user_id, title) VALUES ($1, $2) RETURNING *", // Return all columns
      [user_id, title]
    );

    const submissionId = submissionResult.rows[0].id;

    // Insert into submission_members table
    await Promise.all(
      userIds.map((userId) => {
        return pool.query(
          "INSERT INTO submission_members (submission_id, participating_user_id) VALUES ($1, $2)",
          [submissionId, userId]
        );
      })
    );

    // Return the inserted row from user_submissions table
    res.json(submissionResult.rows[0]);
  } catch (error) {
    console.error(error);
    handleDatabaseError(error, res);
  }
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
