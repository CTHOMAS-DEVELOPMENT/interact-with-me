import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
const NewSubmission = () => {
  const [title, setTitle] = useState("");

  const location = useLocation();
  const loggedInUserId = location.state?.userId;
  const selectedUser = location.state?.selectedUser;
  const selectedUserIds = location.state?.selectedUserIds;
  const navigate = useNavigate();
  const handleBackToMessagesClick = () => {
    navigate("/userlist", { state: { userId: loggedInUserId } }); // Update for v6
  };
  const handleSave = () => {
    let userIds = [loggedInUserId]; // Start with logged-in user

    // If selectedUserIds is populated (and is an array), add it to userIds;
    // otherwise, add selectedUser (if it's not null)
    if (Array.isArray(selectedUserIds) && selectedUserIds.length > 0) {
      userIds = [...userIds, ...selectedUserIds];
    } else if (selectedUser) {
      userIds.push(selectedUser);
    }
    const submissionData = {
      user_id: loggedInUserId,
      title: title,
      userIds: userIds,
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
      <Button
        variant="outline-info"
        className="btn-sm"
        onClick={handleBackToMessagesClick}
      >
        Back to messages
      </Button>{" "}
      <h2 className="font-style-4">Create New Submission</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <Button
        variant="outline-info"
        className="btn-sm"
        onClick={handleSave}
        disabled={title.length < 3}
      >
        Save
      </Button>{" "}
    </div>
  );
};

export default NewSubmission;
