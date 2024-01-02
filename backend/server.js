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
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      const match = await bcrypt.compare(password, user.password);
      if (match) {
        // Include userId in the response
        res.json({ success: true, message: "Login successful.", userId: user.id });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials." });
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
  "/api/users/:userId/uploaded-item",
  upload.single("file"),
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const uploadedFilePath = path.join("/uploaded-images", path.basename(req.file.path)); // Store only the relative path

      const result = await pool.query(
        "INSERT INTO users_uploaded (user_id, uploaded_path) VALUES ($1, $2) RETURNING *",
        [userId, uploadedFilePath]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      handleDatabaseError(error, res);
    }
  }
);

app.get("/api/users/:userId/posts", async (req, res) => {
  try {
    const userId = req.params.userId;

    const query = `
      (SELECT id, user_id, 'text' AS type, text_content AS content, created_at FROM users_text WHERE user_id = $1)
      UNION ALL
      (SELECT id, user_id, 'media' AS type, uploaded_path AS content, created_at FROM users_uploaded WHERE user_id = $1)
      ORDER BY created_at DESC;
    `;

    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error occurred while fetching posts.");
  }
});

app.post("/api/users/:userId/text-entry", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { textContent } = req.body; // Assuming the text content is sent in the body of the request

    // Validate the text content if necessary
    if (!textContent) {
      return res.status(400).json({ message: "Text content is required." });
    }

    const result = await pool.query(
      "INSERT INTO users_text (user_id, text_content) VALUES ($1, $2) RETURNING *",
      [userId, textContent]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    handleDatabaseError(error, res);
  }
});

// Start the server
const PORT = process.env.PORT || 3002;
console.log("DB_PASSWORD", process.env.DB_PASSWORD);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
