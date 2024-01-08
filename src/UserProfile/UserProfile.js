import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation} from "react-router-dom";

//state: { selectedUser: selectedUserId, loggedInUserId: loggedInUserId },

const UserProfile = () => {
    const { userId } = useParams(); // This is the selected user's ID from the URL
    const location = useLocation();
    const state = location.state || {};
    const loggedInUserId = state.loggedInUserId; 
  const navigate = useNavigate();

  const handleInteractClick = () => {
    console.log("selectedUser", userId)
    console.log("loggedInUserId", loggedInUserId)
    navigate("/feed", {
      state: { selectedUser: userId, userId: loggedInUserId },
    });
  };

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
      {/* Other user details */}
      <button onClick={handleInteractClick}>Interact</button>
    </div>
  );
};

export default UserProfile;
