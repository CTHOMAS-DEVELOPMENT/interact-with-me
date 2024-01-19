import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

//state: { selectedUser: selectedUserId, loggedInUserId: loggedInUserId },
//          state: { selectedUser: selectedUserId, loggedInUserId: loggedInUserId, selectedUsername: selectedUsername },

const UserProfile = () => {
  const { userId } = useParams(); // This is the selected user's ID from the URL
  const location = useLocation();
  const state = location.state || {};
  const loggedInUserId = state.loggedInUserId;
  //const selectedUsername = state.selectedUsername;
  const navigate = useNavigate();
  const handleNewInteraction = () => {
    navigate("/newsubmission", {
      state: { selectedUser: userId, userId: loggedInUserId }, // Passing loggedInUserId to NewSubmission
    });
  };
  // const handleInteractClick = () => {
  //   console.log("selectedUser", userId)
  //   console.log("loggedInUserId", loggedInUserId)
  //   console.log("selectedUsername", selectedUsername)

  //   navigate("/feed", {
  //     state: { selectedUser: userId, userId: loggedInUserId },
  //   });
  // };

  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error("Error fetching user:", error));
  }, [userId]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{user.username}'s Profile</h2>
      <p>Email: {user.email}</p>
      <button onClick={handleNewInteraction}>Create New Submission</button>
    </div>
  );
};

export default UserProfile;
