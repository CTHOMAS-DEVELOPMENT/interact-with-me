import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NewSubmission = () => {
  const [title, setTitle] = useState("");

  const location = useLocation();
  //      state: { selectedUser: userId, userId: loggedInUserId }, // Passing loggedInUserId to NewSubmission

  const loggedInUserId = location.state?.userId;
  const selectedUser = location.state?.selectedUser;
  console.log("selectedUser", selectedUser);
  console.log("loggedInUserId", loggedInUserId);
  const navigate = useNavigate();

  const handleSave = () => {
    const submissionData = {
      user_id: loggedInUserId,
      title: title,
    };
    // POST request to backend to save data
    fetch("/api/user_submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submissionData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json(); // Parse JSON response
        } else {
          throw new Error("Submission failed");
        }
      })
      .then((data) => {
        console.log("data", data);

        navigate("/feed", {
            state: {
              submissionId: data.id,
              userId: data.user_id,
              title: data.title,
              selectedUser: selectedUser,
            },
          });
      })
      .catch((error) => {
        console.error("Error saving submission:", error);
      });
  };

  return (
    <div>
      <h2>Create New Submission</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <button onClick={handleSave} disabled={title.length < 3}>
        Save
      </button>
    </div>
  );
};

export default NewSubmission;
