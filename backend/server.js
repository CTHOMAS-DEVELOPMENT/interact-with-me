const express = require("express");
const { Pool, Client } = require("pg");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors"); // Assuming you're using the 'cors' package for Express
const JSZip = require("jszip");
const util = require("util");
const HOST = "localhost";
const PORTFORAPP = "3000";
const PORTNO = 5432;
// Create a new express application
const app = express();
const server = http.createServer(app);

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
//const { OpenAI } = require('openai');
const { HfInference } = require("@huggingface/inference");

function loadEnvVariables() {
  // Adjust if your .env file is located elsewhere. Using __dirname ensures it looks in the same directory as your server.js file.
  const envPath = path.join(__dirname, ".env");

  try {
    const data = fs.readFileSync(envPath, "utf-8");

    // Split the data on new line, compatible with both UNIX and Windows environments
    const envVariables = data.split(/\r?\n/);

    envVariables.forEach((variable) => {
      if (!variable.trim() || variable.startsWith("#")) return; // Skip empty lines and comments

      const [key, value] = variable.split("=");
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  } catch (error) {
    console.error("Error loading .env variables:", error);
  }
}

// Call the function at the start of your application
loadEnvVariables();

const RESET_EMAIL = process.env.RESET_EMAIL;
const HF_TOKEN = process.env.HF_TOKEN;
const JWT_SECRET = process.env.LG_TOKEN;
const PORTFORAPPX = process.env.PORTFORAPP;
console.log("PORTFORAPPX", PORTFORAPPX);

app.use(
  cors({
    origin: `http://localhost:3000`, // Allow your frontend origin
  })
);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Allow your frontend origin
    methods: ["GET", "POST"], // Specify which HTTP methods are allowed
    allowedHeaders: ["my-custom-header"], // Optional: specify headers
    credentials: true, // Optional: if you need credentials
  },
});
// Initialize the HfInference object with your API token
const inference = new HfInference(HF_TOKEN);

(async () => {
  try {
    // Perform a translation task
    const response = await inference.translation({
      model: "t5-base",
      inputs: "My name is Wolfgang and I live in Amsterdam",
    });
  } catch (error) {
    console.error("Error during model inference:", error);
  }
})();
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

const transporter = nodemailer.createTransport({
  service: "gmail", // Example using Gmail
  auth: {
    user: RESET_EMAIL,
    pass: "oevo zajd vezi qjka",
  },
  tls: {
    rejectUnauthorized: false,
  },
});
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
// const pool = new Pool({
//   user: "interactwithme_admin",
//   host: HOST, // Adjust if your DB is hosted elsewhere
//   database: "interactwithmetest",
//   password: "your_secure_password",
//   port: PORTNO, // Default PostgreSQL port
// });
// const pool = new Pool({
//   user: "interactwithmeadmin",
//   host: HOST, // Adjust if your DB is hosted elsewhere
//   database: "interactwithme",
//   password: "interactwithmeadmin",
//   port: PORTNO, // Default PostgreSQL port
// });
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

const connectionString = `postgresql://interactwithmeadmin:interactwithmeadmin@${HOST}:${PORTNO}/interactwithme`;

const pgClient = new Client({ connectionString });
pgClient.connect();

pgClient.query("LISTEN new_post");

// Track clients and their interest in specific submission_ids
const clientSubmissions = {}; // { socketId: { userId: Number, submissionIds: Set(Number) } }
const activeUsersPerSubmission = {};

io.on("connection", (socket) => {
  socket.on("register", ({ userId, submissionIds }) => {
    if (!clientSubmissions[socket.id]) {
        clientSubmissions[socket.id] = { userId, activeUsers: new Set(), submissionIds: new Set(submissionIds) };
    }
    // Add user to active users
    clientSubmissions[socket.id].activeUsers.add(userId);
});

  socket.on("enter screen", ({ userId, submissionId }) => {
    // Ensure this socket joins a room specific to the submissionId
    socket.join(`submission-${submissionId}`);

    if (!activeUsersPerSubmission[submissionId]) {
      activeUsersPerSubmission[submissionId] = new Set();
    }
    activeUsersPerSubmission[submissionId].add(userId);

    // Emit only to sockets in the same submissionId room
    io.to(`submission-${submissionId}`).emit(
      "active users update",
      Array.from(activeUsersPerSubmission[submissionId])
    );
  });

  socket.on("leave screen", ({ userId, submissionId }) => {
    if (activeUsersPerSubmission[submissionId]) {
      activeUsersPerSubmission[submissionId].delete(userId);
      // Emit only to sockets in the same submissionId room
      io.to(`submission-${submissionId}`).emit(
        "active users update",
        Array.from(activeUsersPerSubmission[submissionId])
      );
    }

    // Ensure this socket leaves the room
    socket.leave(`submission-${submissionId}`);
  });
});
pgClient.on("notification", async (msg) => {
  let newPost = JSON.parse(msg.payload); // Assuming newPost is a mutable object here

  // Query the database for users interested in this submission
  const query = `SELECT participating_user_id FROM submission_members WHERE submission_id = $1`;
  const res = await pgClient.query(query, [newPost.submission_id]);
  const interestedUserIds = res.rows.map((row) => row.participating_user_id);
  // Check if the posting user is currently active
  let isActive = false;
  Object.values(clientSubmissions).forEach(({ userId, activeUsers }) => {
    if (activeUsers.has(newPost.posting_user_id)) {
      isActive = true;
    }
  });
  newPost = { ...newPost, interestedUserIds };
  newPost.isActive = isActive;
  // Emit to clients interested in this submission_id
  Object.entries(clientSubmissions).forEach(
    ([socketId, { userId, submissionIds }]) => {
      if (
        interestedUserIds.includes(userId) &&
        submissionIds.has(newPost.submission_id)
      ) {
        io.to(socketId).emit("post update", newPost); // Emit to a specific client, now including interestedUserIds
      }
    }
  );
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

app.post("/api/generate-text", async (req, res) => {
  const { prompt } = req.body; // Extract the prompt from the request body

  // Function to remove the prompt from the generated text
  function removePromptFromGeneratedText(prompt, generatedText) {
    prompt = prompt.trim();
    generatedText = generatedText.trim();

    if (generatedText.startsWith(prompt)) {
      // Remove the prompt and any leading/trailing whitespace or new lines
      return generatedText.slice(prompt.length).trim();
    }

    // If the prompt is not at the start, return the generated text as is
    return generatedText;
  }

  try {
    const response = await inference.textGeneration({
      model: "EleutherAI/gpt-neox-20b", // Adjust model as needed
      inputs: prompt,
      parameters: { max_length: 500 }, // Customize parameters as needed
      options: { use_cache: false },
    });

    // Access the generated text directly
    const generatedText = response.generated_text; // Adjust based on actual output

    // Use the function to clean the generated text by removing the prompt
    const cleanedText = removePromptFromGeneratedText(prompt, generatedText);

    // Send the cleaned text back to the frontend
    res.json({ generatedText: cleanedText });
  } catch (error) {
    console.error("Hugging Face API request failed:", error);
    res.status(500).send("Failed to fetch response from Hugging Face");
  }
});
app.post("/api/summarize-text", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await inference.summarization({
      model: "facebook/bart-large-cnn",
      inputs: text,
      parameters: { max_length: 200, min_length: 50, do_sample: false },
    });

    let summaryText = response.summary_text.trim();

    // Custom logic to ensure the summary isn't longer than the input
    if (summaryText.length > text.length) {
      summaryText = text; // Optionally, could also apply further trimming here
    }

    res.json({ summary: summaryText });
  } catch (error) {
    console.error("Failed to summarize text:", error);
    res.status(500).send("Failed to fetch summary");
  }
});

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

app.get("/api/authorised/:userId", async (req, res) => {
  let tokenMatches = false;
  let token = "";
  const authHeader = req.headers.authorization;
  const userId = req.params.userId;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // If not, respond with 401 Unauthorized and a message
    return res
      .status(401)
      .json({ error: "Unauthorized: Missing or invalid Authorization header" });
  }
  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Extract the token from the Authorization header
    token = authHeader.substring(7, authHeader.length);
  }

  try {
    // Query the users table for the user with the given userId
    const queryResult = await pool.query(
      "SELECT token FROM users WHERE id = $1",
      [userId]
    );

    if (queryResult.rows.length > 0) {
      const userToken = queryResult.rows[0].token;

      // Check if the token from the database matches the token provided in the request
      tokenMatches = userToken === token;
    }
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });
  }

  res.json(tokenMatches);
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
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
          expiresIn: "1h",
        }); // Adjust expiresIn as needed
        await pool.query("UPDATE users SET token = $1 WHERE id = $2", [
          token,
          user.id,
        ]);

        // Include userId in the response
        res.json({
          success: true,
          message: "Login successful.",
          userId: user.id,
          token: token,
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
function determinePartnerPreference(orientation, gender) {
  // Rule 1: Return 'Female' for 'Other'
  if (gender === "Other") {
    return "Female";
  }

  // Handling sexual orientations
  switch (orientation) {
    case "Heterosexual":
    case "Straight":
      // Opposite gender preference
      return gender === "Male" ? "Female" : "Male";
    case "Homosexual":
    case "Gay":
      // Same gender preference
      return gender === "Male" ? "Male" : "Female";
    case "Bisexual":
    case "Pansexual":
    case "Polysexual":
    case "Omnisexual":
    case "Queer":
      // Rule 2: Return 'Female' if the orientation indicates no specific preference
      return "Female";
    case "Asexual":
    case "Demisexual":
      // Rule 2: Applies as no sexual preference is indicated
      return "Female";
    case "Lesbian":
      // Lesbian orientation explicitly indicates a preference for females
      return "Female";
    default:
      // For any unhandled or unknown orientations, or if no preference is indicated
      return "Female";
  }
}
app.post("/api/register", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      username,
      email,
      password,
      hobby,
      sexualOrientation,
      floatsMyBoat,
      sex,
    } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const hashedPasswordForAdmin = await bcrypt.hash(
      "admin" + password,
      saltRounds
    );

    await client.query("BEGIN"); // Start transaction

    // Insert the new User
    const userInsertResult = await client.query(
      "INSERT INTO users (username, email, password, hobbies, sexual_orientation, floats_my_boat, sex) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      [
        username,
        email,
        hashedPassword,
        hobby,
        sexualOrientation,
        floatsMyBoat,
        sex,
      ]
    );
    const newUsersValue = userInsertResult.rows[0];
    const newUserId = newUsersValue.id;
    const usersAdminSex = determinePartnerPreference(sexualOrientation, sex);
    const usersAdminProfilePicture =
      usersAdminSex === "Female"
        ? "backend\\imageUploaded\\file-WOMAN.png"
        : "backend\\imageUploaded\\file-MAN.png";

    // Insert user's dedicated admin
    const adminInsertResult = await client.query(
      "INSERT INTO users (username, email, password, hobbies, sexual_orientation, floats_my_boat, sex, profile_picture) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
      [
        "Admin for " + username,
        username + "@system.com",
        hashedPasswordForAdmin,
        hobby,
        sexualOrientation,
        floatsMyBoat,
        usersAdminSex,
        usersAdminProfilePicture,
      ]
    );
    const newAdminId = adminInsertResult.rows[0].id;

    // Insert the connection record
    await client.query(
      "INSERT INTO connections (user_one_id, user_two_id) VALUES ($1, $2)",
      [newUserId, newAdminId]
    );

    await client.query("COMMIT"); // Commit the transaction

    res.json(newUsersValue);
  } catch (error) {
    await client.query("ROLLBACK"); // Roll back the transaction on error
    console.error(error);
    res.status(500).send("An error occurred during registration.");
  } finally {
    client.release(); // Release the client back to the pool
  }
});

app.put("/api/update_profile/:id", async (req, res) => {
  const { id } = req.params;
  let {
    username,
    email,
    password,
    hobby,
    sexualOrientation,
    floatsMyBoat,
    sex,
  } = req.body;

  // Validation for password length if it's not empty
  if (password && password.trim().length < 8) {
    return res.status(400).send("Password must be at least 8 characters long");
  }

  // Optionally, hash the new password before storing it
  const saltRounds = 10;
  const hashedPassword = password
    ? await bcrypt.hash(password, saltRounds)
    : undefined;

  // Substitute empty strings with specified default values for enum fields
  sexualOrientation =
    sexualOrientation === "" ? "Undisclosed" : sexualOrientation;
  hobby = hobby === "" ? "Other" : hobby;
  floatsMyBoat = floatsMyBoat === "" ? "Other (Not Listed)" : floatsMyBoat;

  const updateQuery = `
  UPDATE users SET
  username = COALESCE($1, username),
  email = COALESCE($2, email),
  password = COALESCE($3, password),
  hobbies = COALESCE($4, hobbies),
  sexual_orientation = COALESCE($5, sexual_orientation),
  floats_my_boat = COALESCE($6, floats_my_boat),
  sex = COALESCE($7, sex)
  WHERE id = $8
  RETURNING *;
`;

  const values = [
    username,
    email,
    hashedPassword ? hashedPassword : null,
    hobby,
    sexualOrientation,
    floatsMyBoat,
    sex, // Add the 'sex' to the values array
    id,
  ];

  try {
    const result = await pool.query(updateQuery, values);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).send("Failed to update profile");
  }
});

app.post("/api/filter-users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, sexualOrientation, hobbies, floatsMyBoat, sex } =
      req.body;

    // Initialize the query parts
    let queryConditions = [];
    let queryParams = [];
    let paramCounter = 1;

    // Dynamically build query conditions and parameters
    if (username) {
      queryConditions.push(`username ILIKE '%' || $${paramCounter++} || '%'`);
      queryParams.push(username);
    }
    if (sexualOrientation) {
      queryConditions.push(`sexual_orientation = $${paramCounter++}`);
      queryParams.push(sexualOrientation);
    }
    if (hobbies) {
      queryConditions.push(`hobbies = $${paramCounter++}`);
      queryParams.push(hobbies);
    }
    if (floatsMyBoat) {
      queryConditions.push(`floats_my_boat = $${paramCounter++}`);
      queryParams.push(floatsMyBoat);
    }
    if (sex) {
      queryConditions.push(`sex = $${paramCounter++}`);
      queryParams.push(sex);
    }

    let query = `
      SELECT id, username, email, sexual_orientation, hobbies, floats_my_boat, sex 
      FROM users 
      WHERE ${
        queryConditions.length > 0 ? queryConditions.join(" AND ") : "1=1"
      }
    `;

    // Fetch filtered users based on criteria
    const filteredUsers = await pool.query(query, queryParams);

    // Populate connection_requests for each filtered user
    if (filteredUsers.rows.length > 0) {
      const insertQuery = `
        INSERT INTO connection_requests (requester_id, requested_id, status)
        SELECT $1, id, 'pending' 
        FROM unnest($2::int[]) AS id
        WHERE id != $1
      `;
      await pool.query(insertQuery, [
        userId,
        filteredUsers.rows.map((user) => user.id),
      ]);
    }

    res.json({
      success: true,
      message: "Connection requests sent.",
      filteredUsers: filteredUsers.rows,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "An error occurred.", error: error.message });
  }
});
app.get("/api/connection-requests/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // SQL query to join connection_requests and users tables
    const query = `
      SELECT cr.id, cr.requester_id, cr.requested_id, cr.status, cr.created_at, cr.updated_at,
             u.username, u.email, u.profile_picture, u.sexual_orientation, u.hobbies, u.floats_my_boat, u.sex
      FROM connection_requests cr
      JOIN users u ON cr.requested_id = u.id
      WHERE cr.requester_id = $1
    `;

    const { rows } = await pool.query(query, [userId]);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching connection requests:", error);
    res.status(500).send({
      message: "An error occurred while fetching connection requests.",
    });
  }
});
app.get("/api/connection-requested/:userId", async (req, res) => {
  const { userId } = req.params; // Extract userId from the request URL

  // SQL query to fetch details of connection requests aimed at the specified user
  const query = `
    SELECT 
      cr.id AS request_id, 
      cr.requester_id, 
      cr.requested_id, 
      cr.status, 
      cr.created_at, 
      cr.updated_at,
      u.id, 
      u.username, 
      u.profile_picture, 
      u.sexual_orientation, 
      u.hobbies, 
      u.floats_my_boat, 
      u.sex
    FROM 
      connection_requests AS cr
    JOIN 
      users AS u ON cr.requester_id = u.id
    WHERE 
      cr.requested_id = $1;
  `;

  try {
    // Execute the query with the userId provided in the URL
    const { rows } = await pool.query(query, [userId]);

    // Send the result back to the client
    res.json(rows);
  } catch (error) {
    console.error("Error fetching connection requests:", error);
    res
      .status(500)
      .send("An error occurred while fetching connection requests.");
  }
});
app.post(
  "/api/enable-selected-connections/:loggedInUserId",
  async (req, res) => {
    const { loggedInUserId } = req.params; // The ID of the user making the connection approvals
    const { selectedUserIds } = req.body; // Array of IDs that the logged-in user wishes to connect with

    try {
      await pool.query("BEGIN"); // Start a transaction

      for (const requestedId of selectedUserIds) {
        // Ensure user IDs are integers to prevent SQL injection
        const requesterIdInt = parseInt(requestedId, 10);
        const requestedIdInt = parseInt(loggedInUserId, 10);

        // Delete the corresponding request from `connection_requests`
        await pool.query(
          `DELETE FROM connection_requests WHERE requester_id = $1 AND requested_id = $2`,
          [requesterIdInt, requestedIdInt]
        );

        // Insert the new connection into `connections`
        // Assuming `user_one_id` should always be the lower ID to maintain consistency
        const [userOneId, userTwoId] =
          requesterIdInt < requestedIdInt
            ? [requesterIdInt, requestedIdInt]
            : [requestedIdInt, requesterIdInt];

        await pool.query(
          `INSERT INTO connections (user_one_id, user_two_id) VALUES ($1, $2)`,
          [userOneId, userTwoId]
        );
      }

      await pool.query("COMMIT"); // Commit the transaction
      res.json({ success: true, message: "Connections successfully enabled." });
    } catch (error) {
      await pool.query("ROLLBACK"); // Rollback the transaction in case of an error
      console.error("Error enabling connections:", error);
      res.status(500).send({
        success: false,
        message: "An error occurred while enabling connections.",
      });
    }
  }
);
app.post("/api/delete-from-connection-requests/:id", async (req, res) => {
  const { id } = req.params; // Extracting the id from the request parameters

  try {
    // Perform the delete operation
    const deleteQuery =
      "DELETE FROM connection_requests WHERE id = $1 RETURNING *;"; // RETURNING * is optional and returns the deleted row
    const result = await pool.query(deleteQuery, [id]);

    if (result.rowCount === 0) {
      // If no row was deleted, send a 404 response
      res
        .status(404)
        .send({ success: false, message: "Connection request not found." });
    } else {
      // On successful deletion, return the deleted record or a success message
      res.json({
        success: true,
        message: "Connection request successfully deleted.",
        deletedRecord: result.rows[0],
      });
    }
  } catch (error) {
    console.error("Error deleting connection request:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while deleting the connection request.",
    });
  }
});

app.get("/api/connectedX/:userId", async (req, res) => {
  try {
    // Extract the userId from the request's path parameters
    const { userId } = req.params;

    // Updated query to include both the current user and their associated users
    const query = `
      -- Select the current user
      (SELECT id, username, email, sexual_orientation, hobbies, floats_my_boat, sex 
       FROM users 
       WHERE id = $1)

      UNION

      -- Select associated users
      (SELECT U2.id, U2.username, U2.email, U2.sexual_orientation, U2.hobbies, U2.floats_my_boat, U2.sex 
       FROM users U1
       JOIN connections ON U1.id = connections.user_one_id OR U1.id = connections.user_two_id
       JOIN users U2 ON U2.id = connections.user_one_id OR U2.id = connections.user_two_id
       WHERE U1.id = $1 AND U2.id != $1
       ORDER BY username);

    `;

    // Execute the query with the userId as a parameter
    const result = await pool.query(query, [userId]);

    // Send the result back to the client
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred." });
  }
});
app.get("/api/connected/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      (SELECT 
        null as connection_id, -- Placeholder for the current user
        id, 
        username, 
        email, 
        sexual_orientation, 
        hobbies, 
        floats_my_boat, 
        sex 
      FROM 
        users 
      WHERE 
        id = $1)

      UNION

      (SELECT 
        connections.id as connection_id, -- Include connection ID for associated users
        U2.id, 
        U2.username, 
        U2.email, 
        U2.sexual_orientation, 
        U2.hobbies, 
        U2.floats_my_boat, 
        U2.sex 
      FROM 
        users U1
        JOIN connections ON U1.id = connections.user_one_id OR U1.id = connections.user_two_id
        JOIN users U2 ON U2.id = connections.user_one_id OR U2.id = connections.user_two_id
      WHERE 
        U1.id = $1 AND U2.id != $1
      ORDER BY 
        username);
    `;

    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred." });
  }
});
app.delete("/api/delete-requests-from-me/:userId", async (req, res) => {
  const { userId } = req.params; // Extract userId from the request URL

  try {
    // Delete all connection requests where the requester_id matches the userId provided
    const result = await pool.query(
      "DELETE FROM connection_requests WHERE requester_id = $1",
      [userId]
    );

    // Check if rows were deleted
    if (result.rowCount > 0) {
      res.json({
        success: true,
        message: `Deleted ${result.rowCount} connection request(s) from user ${userId}.`,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No connection requests found to delete for this user.",
      });
    }
  } catch (error) {
    console.error("Error deleting connection requests from user:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while deleting connection requests.",
    });
  }
});

app.delete("/api/delete-requests-to-me/:userId", async (req, res) => {
  const { userId } = req.params; // Extract userId from the request URL parameters

  try {
    // Prepare and execute the DELETE query
    const query = `DELETE FROM connection_requests WHERE requested_id = $1`;
    const result = await pool.query(query, [userId]);

    // Check if rows were deleted
    if (result.rowCount > 0) {
      res.json({
        success: true,
        message: "Connection requests successfully deleted.",
      });
    } else {
      res.json({
        success: false,
        message: "No connection requests found for the user.",
      });
    }
  } catch (error) {
    console.error("Error deleting connection requests:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while deleting connection requests.",
    });
  }
});

app.delete("/api/delete-connection/:id", async (req, res) => {
  const { id } = req.params; // Extract the ID from the URL parameter

  try {
    // Start a transaction
    await pool.query("BEGIN");

    // SQL query to delete the record from connections table
    const query = "DELETE FROM connections WHERE id = $1";

    // Execute the query
    const result = await pool.query(query, [id]);

    // If the query didn't affect any row, the ID was not found
    if (result.rowCount === 0) {
      await pool.query("ROLLBACK"); // Rollback the transaction
      return res.status(404).json({ message: "Connection not found." });
    }

    // Commit the transaction
    await pool.query("COMMIT");

    // Send back a success response
    res.status(200).json({ message: "Connection successfully deleted." });
  } catch (error) {
    await pool.query("ROLLBACK"); // Rollback the transaction in case of an error
    console.error("Error deleting connection:", error);
    res.status(500).send("An error occurred while deleting the connection.");
  }
});
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, profile_picture, profile_video, email, sexual_orientation, hobbies, floats_my_boat, sex FROM users ORDER BY username"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred." });
  }
});

async function findUserById(userId) {
  try {
    const query = `SELECT profile_picture FROM users WHERE id = $1`;
    const values = [userId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null; // User not found
    }

    // Assuming profile_picture stores either a path or a URL
    const userProfilePicture = result.rows[0].profile_picture;
    return userProfilePicture;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error; // Rethrow the error for calling function to handle
  }
}
app.post("/api/upload-audio", upload.single("audio"), async (req, res) => {
  try {
    const { submissionId, userId } = req.body; // Extract the submissionId and userId from the request body
    const uploadedFilePath = path.join(
      "/uploaded-images", // Ensure all audio files go to the 'uploaded-audio' directory
      path.basename(req.file.path)
    );

    // Insert into the submission_dialog table
    const result = await pool.query(
      "INSERT INTO submission_dialog (submission_id, posting_user_id, uploaded_path) VALUES ($1, $2, $3) RETURNING *",
      [submissionId, userId, uploadedFilePath] // Include type of upload if your table supports it
    );

    res.json(result.rows[0]); // Return the new database entry
  } catch (error) {
    console.error("Failed to upload audio file:", error);
    res.status(500).send("Error uploading audio file.");
  }
});
app.get("/api/users/:userId/profile-picture", async (req, res) => {
  const { userId } = req.params;

  try {
    const profilePicturePath = await findUserById(userId);
    if (!profilePicturePath) {
      return res
        .status(404)
        .json({ message: "User not found or no profile picture set" });
    }

    // Adjust the path to be relative to the static directory you've set up in Express
    // Assuming profilePicturePath format is "backend/imageUploaded/file-name.jpg"
    const urlPath = profilePicturePath.replace(
      /^backend\\imageUploaded\\/,
      "/uploaded-images/"
    );
    res.json({ profilePicture: urlPath });
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post(
  "/api/users/:userId/profile-picture",
  upload.single("file"),
  async (req, res) => {
    try {
      const userId = req.params.userId;
      // Start a transaction
      await pool.query("BEGIN");

      const filePath = req.file.path;
      const thumbnailPath = path.join(
        path.dirname(filePath),
        "thumb-" + path.basename(filePath)
      );

      // Retrieve the original image dimensions
      const metadata = await sharp(filePath).metadata();
      const longerDimension =
        metadata.width > metadata.height ? "width" : "height";
      const resizeOptions = {
        [longerDimension]: 100, // Set the longer dimension to 100 pixels
      };

      // Generate thumbnail while maintaining aspect ratio
      await sharp(filePath).resize(resizeOptions).toFile(thumbnailPath);

      // First, retrieve the current profile picture path for the user, if it exists
      const { rows: existingUser } = await pool.query(
        "SELECT profile_picture FROM users WHERE id = $1",
        [userId]
      );

      // If there's an existing profile picture, delete the file
      if (existingUser.length > 0 && existingUser[0].profile_picture) {
        const existingFilePath = existingUser[0].profile_picture;
        // Assuming your file paths are stored relative to a base directory you define (for safety)
        //const baseDir = path.resolve(__dirname, 'pathToYourImagesDirectory'); // Adjust to your images directory
        const sanitizedPath = existingFilePath.replace(
          /backend\\imageUploaded\\/g,
          ""
        );
        const baseDir = path.resolve(__dirname, "imageUploaded");
        const fullPath = path.join(baseDir, sanitizedPath);

        if (fs.existsSync(fullPath)) {
          await fs.promises.unlink(fullPath);
        }
      }

      // Update the user's profile picture path in the database
      const profilePicturePath = req.file.path;
      const result = await pool.query(
        "UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING *",
        [profilePicturePath, userId]
      );

      // Commit the transaction
      await pool.query("COMMIT");

      res.json(result.rows[0]);
    } catch (error) {
      // Rollback in case of error
      await pool.query("ROLLBACK");
      console.error(error);
      handleDatabaseError(error, res);
    }
  }
);

// Separate multer configuration for profile video uploads
const videoUpload = multer({
  storage: multer.diskStorage({
    destination: 'backend/imageUploaded', // Adjust directory path as needed
    filename: (req, file, cb) => {
      cb(null, 'profile-video-' + Date.now() + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    // Accept videos only
    if (!file.originalname.match(/\.(mp4|mov)$/)) {
      req.fileValidationError = 'Only video files are allowed!';
      return cb(new Error('Only video files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB size limit
}).single('profileVideo');

app.post('/api/users/:userId/upload-profile-video', (req, res) => {
  videoUpload(req, res, async (err) => {
    if (req.fileValidationError) {
      return res.status(400).send(req.fileValidationError);
    }
    if (err instanceof multer.MulterError) {
      return res.status(500).send(err.message);
    } else if (err) {
      return res.status(500).send(err.message);
    }

    // No error thrown by multer, file has been uploaded successfully
    const userId = req.params.userId;
    const profileVideoPath = req.file.path; // The file path where the video is stored

    try {
      const result = await pool.query(
        'UPDATE users SET profile_video = $1 WHERE id = $2 RETURNING *',
        [profileVideoPath, userId]
      );

      if (result.rows.length > 0) {
        res.status(200).json({ message: 'Profile video updated successfully.', user: result.rows[0] });
      } else {
        res.status(404).send({ message: 'User not found.' });
      }
    } catch (error) {
      console.error('Error updating profile video:', error);
      res.status(500).send({ message: 'Error updating profile video.' });
    }
  });
});

app.delete("/api/submission-dialog/:dialogId", async (req, res) => {
  const { dialogId } = req.params;

  try {
    const selectQuery =
      "SELECT uploaded_path FROM submission_dialog WHERE id = $1";
    const selectResult = await pool.query(selectQuery, [dialogId]);

    if (selectResult.rows.length > 0) {
      const { uploaded_path } = selectResult.rows[0];

      if (uploaded_path) {
        const filePath = path.join(
          __dirname,
          "imageUploaded",
          path.basename(uploaded_path)
        );
        try {
          if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath); // Asynchronously delete the file
          }
        } catch (err) {
          return res.status(500).send("Error deleting the file.");
        }
      }

      // Proceed to delete the database record whether or not a file was present/deleted
      const deleteQuery = "DELETE FROM submission_dialog WHERE id = $1";
      await pool.query(deleteQuery, [dialogId]);

      res.json({ message: "Dialog record deleted successfully." });
    } else {
      res.status(404).send("Dialog record not found.");
    }
  } catch (error) {
    console.error("Error in deletion process:", error);
    res.status(500).send("Error during the deletion process.");
  }
});

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

app.post(
  "/api/submission-dialog/:dialogId/update-item",
  upload.single("file"),
  async (req, res) => {
    const dialogId = req.params.dialogId; // Get the dialog ID from the URL parameter
    try {
      // Start a transaction
      await pool.query("BEGIN");

      // Retrieve the current uploaded_path
      const selectQuery =
        "SELECT uploaded_path FROM submission_dialog WHERE id = $1";
      const selectResult = await pool.query(selectQuery, [dialogId]);
      if (selectResult.rows.length > 0 && selectResult.rows[0].uploaded_path) {
        // Delete the old file
        const oldFilePath = selectResult.rows[0].uploaded_path;
        const fullOldFilePath = path.join(
          __dirname,
          "imageUploaded",
          path.basename(oldFilePath)
        );
        if (fs.existsSync(fullOldFilePath)) {
          await fs.promises.unlink(fullOldFilePath);
          console.log(`Deleted old file: ${fullOldFilePath}`);
        }
      } else {
        throw new Error("No existing file path found.");
      }

      // Construct the new file path
      const uploadedFilePath = path.join(
        "/uploaded-images",
        path.basename(req.file.path)
      );

      // Update the uploaded_path in the submission_dialog table
      const updateQuery =
        "UPDATE submission_dialog SET uploaded_path = $1 WHERE id = $2 RETURNING *";
      const updateResult = await pool.query(updateQuery, [
        uploadedFilePath,
        dialogId,
      ]);
      if (updateResult.rows.length) {
        // Commit the transaction
        await pool.query("COMMIT");
        res.json(updateResult.rows[0]); // Send back the updated record
      } else {
        throw new Error("No dialog found to update.");
      }
    } catch (error) {
      // Rollback in case of error
      await pool.query("ROLLBACK");
      console.error(error);
      res.status(500).send("Server error occurred while updating the item.");
    }
  }
);
app.patch("/api/submission-dialog/:dialogId", async (req, res) => {
  const dialogId = req.params.dialogId;
  const newTextContent = req.body.text_content;

  if (!newTextContent.trim()) {
    return res.status(400).send("Text content is required.");
  }

  try {
    // Start a transaction
    await pool.query("BEGIN");

    // Update text_content in the submission_dialog table
    const updateQuery =
      "UPDATE submission_dialog SET text_content = $1 WHERE id = $2 RETURNING *";
    const result = await pool.query(updateQuery, [newTextContent, dialogId]);

    if (result.rows.length) {
      // Commit the transaction
      await pool.query("COMMIT");
      res.json(result.rows[0]); // Send back the updated record
    } else {
      res.status(404).send("Submission dialog not found.");
    }
  } catch (error) {
    // Rollback in case of error
    await pool.query("ROLLBACK");
    console.error(error);
    res
      .status(500)
      .send("Server error occurred while updating the text content.");
  }
});

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
    u.profile_picture,
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
    await pool.query("BEGIN");

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
    await pool.query("COMMIT");

    res.send({ message: "Group updated successfully." });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    res
      .status(500)
      .send({ message: "An error occurred while updating the group." });
  }
});
app.get("/api/closed-interaction-zip/:submissionId", async (req, res) => {
  const submissionId = req.params.submissionId;
  const title = req.query.title || "interaction"; // Get title from query parameter, fallback to 'interaction'

  try {
    // Fetch posts for the given submissionId
    const query = `
      SELECT
        sd.id,
        sd.submission_id,
        sd.posting_user_id,
        sd.text_content AS content,
        sd.uploaded_path,
        sd.created_at,
        u.username,
        u.profile_picture,
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
    const posts = result.rows;

    const zip = new JSZip();
    // Title for the ZIP based on the title query parameter or default to 'interaction.zip'
    const zipTitle = `${title.replace(/\s+/g, "_")}.zip`;

    // Add JSON file to the ZIP
    zip.file(
      `${zipTitle.replace(".zip", ".json")}`,
      JSON.stringify(posts, null, 2)
    );

    // Loop through posts to add any media files to the ZIP
    for (const post of posts.filter((post) => post.uploaded_path)) {
      // Sanitize and resolve the full path for the uploaded file
      const sanitizedPath = post.uploaded_path.replace("uploaded-images\\", "");
      const fullPath = path.join(__dirname, "imageUploaded", sanitizedPath);

      // Ensure the file exists before attempting to add it to the ZIP
      if (fs.existsSync(fullPath)) {
        zip.file(path.basename(fullPath), fs.readFileSync(fullPath));
      } else {
        console.log(`File not found: ${fullPath}`);
      }
    }
    zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(res)
      .on("finish", function () {
        res.status(200).end();
      });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error occurred while creating ZIP.");
  }
});
app.post(
  "/api/build-interaction-from-files",
  upload.single("zipFile"),
  async (req, res) => {
    // Ensure a file was uploaded and the userId is present
    if (!req.file || !req.body.userId) {
      return res.status(400).json({
        error: "No ZIP file was uploaded, or userId is missing.",
      });
    }

    const zipFile = req.file.path;
    const userId = req.body.userId;

    try {
      const data = fs.readFileSync(zipFile);
      const zip = await JSZip.loadAsync(data);
      const zipFiles = Object.keys(zip.files);

      let jsonFileCount = 0;
      let isValid = true;
      let imageFileCount = 0;
      let interactionData;
      const mediaFiles = [];
      zipFiles.forEach((filename) => {
        if (filename.endsWith(".json")) {
          jsonFileCount++;
        } else if (filename.match(/\.(jpg|jpeg|png)$/i)) {
          imageFileCount++;
        } else {
          isValid = false;
        }
      });

      if (jsonFileCount !== 1) {
        isValid = false; // There must be exactly one JSON file
      }

      if (!isValid) {
        return res.status(400).json({
          error:
            "ZIP archive contents are invalid. It should contain exactly one JSON file and any number of image files.",
        });
      }

      // Process valid ZIP contents here
      // Extract JSON and media files from the ZIP
      for (const [filename, fileData] of Object.entries(zip.files)) {
        if (filename.endsWith(".json")) {
          const content = await fileData.async("string");
          interactionData = JSON.parse(content);
        } else {
          // Prepare for saving media files later
          const mediaData = await fileData.async("nodebuffer");
          mediaFiles.push({ filename, mediaData });
        }
      }
      if (!interactionData) {
        throw new Error("No JSON file found in the ZIP archive.");
      }

      // Derive the interaction title from the ZIP file name
      const interactionTitle = req.file.originalname
        .replace(/_/g, " ")
        .replace(".zip", "");

      // Insert the interaction title and userId into the database
      const submissionResult = await pool.query(
        "INSERT INTO user_submissions (user_id, title) VALUES ($1, $2) RETURNING id",
        [userId, interactionTitle]
      );
      const submissionId = submissionResult.rows[0].id;

      // Save media files to the server and update interactionData with new paths
      for (const { filename, mediaData } of mediaFiles) {
        const sanitizedFilename = filename.replace("uploaded-images\\", "");
        const fullPath = path.join(
          __dirname,
          "imageUploaded",
          sanitizedFilename
        );
        const relativePath = `/uploaded-images/${sanitizedFilename}`;
        // Ensure the directory exists
        await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });

        // Save the media file
        await fs.promises.writeFile(fullPath, mediaData);

        // Update interactionData entries with the new file path
        interactionData = interactionData.map((entry) => {
          if (entry.uploaded_path && entry.uploaded_path.includes(filename)) {
            return { ...entry, uploaded_path: relativePath }; // Ensures the use of relativePath
          }
          return entry;
        });
      }

      const uniqueUserIds = [
        ...new Set(interactionData.map((entry) => entry.posting_user_id)),
      ];
      // Insert unique posting_user_ids into submission_members
      for (const postingUserId of uniqueUserIds) {
        await pool.query(
          "INSERT INTO submission_members (submission_id, participating_user_id) VALUES ($1, $2)",
          [submissionId, postingUserId]
        );
      }

      // Insert interaction data into the database
      for (const entry of interactionData) {
        await pool.query(
          "INSERT INTO submission_dialog (submission_id, posting_user_id, text_content, uploaded_path, created_at) VALUES ($1, $2, $3, $4, $5)",
          [
            submissionId,
            entry.posting_user_id,
            entry.content,
            entry.uploaded_path,
            entry.created_at,
          ]
        );
      }

      //res.send({ message: 'Interaction rebuilt successfully', submissionId });

      // Cleanup: Remove the uploaded ZIP file after processing
      await util.promisify(fs.unlink)(zipFile);

      // Return a JSON response indicating success
      return res.json({
        message: `Successfully processed ZIP file with ${jsonFileCount} JSON file and ${imageFileCount} image files.`,
      });
    } catch (error) {
      console.error("Error processing ZIP file:", error);
      return res.status(500).json({
        error: "Error processing ZIP file.",
      });
    }
  }
);

async function deleteExpiredInteractions() {
  await pool.query("BEGIN");

  try {
    // Get the paths of all images to be deleted
    const { rows: imagesToDelete } = await pool.query(`
      SELECT uploaded_path FROM submission_dialog
      WHERE submission_id IN (
        SELECT id FROM user_submissions
        WHERE (2 * 24 * 60 * 60 - EXTRACT(epoch FROM NOW() - lastuser_addition)) < 0
      )
    `);

    // Delete the images from the filesystem
    for (const row of imagesToDelete) {
      if (typeof row.uploaded_path === "string") {
        // Assuming the actual physical path doesn't need the "uploaded-images" segment.
        const sanitizedPath = row.uploaded_path.replace(
          "uploaded-images\\",
          ""
        );
        const fullPath = path.join(__dirname, "imageUploaded", sanitizedPath);

        try {
          if (fs.existsSync(fullPath)) {
            await fs.promises.unlink(fullPath);
            console.log(`Successfully deleted: ${fullPath}`);
          } else {
            console.log(`File not found: ${fullPath}, skipping deletion.`);
          }
        } catch (error) {
          console.error(`Failed to delete file ${fullPath}: `, error);
        }
      } else {
        console.log("Invalid path encountered, skipping deletion.");
      }
    }

    // Continue with database deletions as before...
    // First, delete from the submission_dialog table
    await pool.query(`
      DELETE FROM submission_dialog
      WHERE submission_id IN (
        SELECT id FROM user_submissions
        WHERE (2 * 24 * 60 * 60 - EXTRACT(epoch FROM NOW() - lastuser_addition)) < 0
      )
    `);

    // Next, delete from the submission_members table
    await pool.query(`
      DELETE FROM submission_members
      WHERE submission_id IN (
        SELECT id FROM user_submissions
        WHERE (2 * 24 * 60 * 60 - EXTRACT(epoch FROM NOW() - lastuser_addition)) < 0
      )
    `);

    // Finally, delete from the user_submissions table
    await pool.query(`
      DELETE FROM user_submissions
      WHERE (2 * 24 * 60 * 60 - EXTRACT(epoch FROM NOW() - lastuser_addition)) < 0
    `);
    // Commit the transaction
    await pool.query("COMMIT");
  } catch (error) {
    console.error("Error during transaction, rolling back:", error);
    await pool.query("ROLLBACK");
    // Decide if you want to rethrow the error or handle it differently
  }
}
app.post("/api/end_interaction", async (req, res) => {
  const { submissionId } = req.body; // Extract the submissionId from the request body

  try {
    await pool.query("BEGIN");

    const updateQuery = `
      UPDATE user_submissions
      SET lastuser_addition = lastuser_addition - interval '2 days'
      WHERE id = $1
    `;

    await pool.query(updateQuery, [submissionId]);

    await pool.query("COMMIT");

    res.json({ message: "Interaction ended successfully." });
  } catch (error) {
    console.error("Error during ending interaction:", error);
    await pool.query("ROLLBACK");
    res.status(500).send("Failed to end interaction");
  }
});

app.get("/api/my_interaction_titles", async (req, res) => {
  try {
    const loggedInId = req.query.logged_in_id; // Get the logged-in user's ID from the query parameters
    if (!loggedInId) {
      return res.status(400).send({ message: "Logged in ID is required." });
    }
    await deleteExpiredInteractions();

    const query = `
    SELECT 
    us.id AS submission_id, 
    us.title, 
    TO_CHAR(us.created_at, 'Day, DD Month YYYY HH24:MI') AS formatted_created_at,
    TO_CHAR(us.created_at, 'Mon DD HH24:MI') AS formatted_created_at_mobile,
    CONCAT(
      FLOOR(EXTRACT(epoch FROM interval '2 days' - (NOW() - us.lastuser_addition))/86400) || ' Days ',
      FLOOR((EXTRACT(epoch FROM interval '2 days' - (NOW() - us.lastuser_addition)) % 86400) / 3600) || ' Hours ',
      FLOOR((EXTRACT(epoch FROM interval '2 days' - (NOW() - us.lastuser_addition)) % 3600) / 60) || ' Minutes ',
      FLOOR(EXTRACT(epoch FROM interval '2 days' - (NOW() - us.lastuser_addition)) % 60) || ' Seconds'
    ) AS expected_end,
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
    res.status(500).send({
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
      SELECT u.id, u.username, us.title 
      FROM submission_members sm 
      JOIN users u ON sm.participating_user_id = u.id 
      JOIN user_submissions us ON sm.submission_id = us.id 
      WHERE sm.submission_id = $1 AND sm.participating_user_id != us.user_id;
    `;

    const result = await pool.query(query, [submissionId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message:
        "An error occurred while fetching user list for the interaction.",
    });
  }
});

app.get("/api/interaction_feed_user_list", async (req, res) => {
  try {
    const submissionId = req.query.submission_id; // Get the submission ID from the query parameters

    if (!submissionId) {
      return res.status(400).send({ message: "Submission ID is required." });
    }

    const query = `
      SELECT u.id, u.username, us.title, u.profile_picture 
      FROM submission_members sm 
      JOIN users u ON sm.participating_user_id = u.id 
      JOIN user_submissions us ON sm.submission_id = us.id 
      WHERE sm.submission_id = $1;
    `;

    const result = await pool.query(query, [submissionId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message:
        "An error occurred while fetching user list for the interaction.",
    });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, username, email, profile_picture, profile_video, sexual_orientation, hobbies, floats_my_boat, sex FROM users WHERE id = $1",
      [id] // Make sure to select the new 'sex' column here
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred." });
  }
});

app.post("/api/users/:submissionId/text-entry", async (req, res) => {
  try {
    const submissionId = req.params.submissionId; // Extract submissionId from the URL parameters
    const { userId, textContent } = req.body; // Extracting userId and textContent from the request body

    // Validate the received data
    if (!userId || !textContent) {
      return res
        .status(400)
        .json({ message: "User ID and text content are required." });
    }

    // Start a transaction
    await pool.query("BEGIN");

    // Insert into the submission_dialog table
    const insertResult = await pool.query(
      "INSERT INTO submission_dialog (submission_id, posting_user_id, text_content) VALUES ($1, $2, $3) RETURNING *",
      [submissionId, userId, textContent]
    );

    // Update the lastuser_addition field in the user_submissions table where id is equal to submissionId
    const updateResult = await pool.query(
      "UPDATE user_submissions SET lastuser_addition = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [submissionId]
    );

    // Commit the transaction
    await pool.query("COMMIT");

    // Respond with the new dialog entry
    // If you also want to send the updated submission, you can include updateResult.rows[0]
    res.json({
      dialogEntry: insertResult.rows[0],
      submissionUpdate: updateResult.rows[0],
    });
  } catch (error) {
    // Rollback the transaction on error
    await pool.query("ROLLBACK");

    console.error(error);
    res.status(500).json({
      message: "An error occurred while updating the interaction.",
      error: error,
    });
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
// In your server code

const crypto = require("crypto");

app.post("/api/password_reset_request", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    // Generate a secure token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Save this token in the database associated with the user's email
    await pool.query("UPDATE users SET token = $1 WHERE email = $2", [
      resetToken,
      email,
    ]);

    // Create reset URL
    const resetUrl = `http://${HOST}:${PORTFORAPP}/password-reset?token=${resetToken}`;

    // Send email
    const mailOptions = {
      from: RESET_EMAIL,
      to: email,
      subject: "Password Reset Request",
      text: `Please click on the following link to reset your password: ${resetUrl}`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
        // If there's an error sending the email, consider whether you should also roll back the token update
        return res.status(500).json({ message: "Error sending email" });
      }
      res.status(200).json({
        success: true,
        message: "Reset password link has been sent to your email.",
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/update_user_password", async (req, res) => {
  const { token, password } = req.body;

  try {
    // First, verify the token by finding the user it belongs to
    const user = await pool.query("SELECT * FROM users WHERE token = $1", [
      token,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Optionally, check if the token has expired (if you've implemented expiration)

    // Hash the new password before storing it
    const saltRounds = 10; // You can adjust salt rounds as needed
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update the user's password and clear the token from the database
    await pool.query(
      "UPDATE users SET password = $1, token = NULL WHERE token = $2",
      [hashedPassword, token]
    );

    // Respond to the client that the password has been reset
    res.json({ message: "Password successfully updated" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error while updating password" });
  }
});

// Start the server
const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
