import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { checkAuthorization } from '../system/authService';
const UserProfile = () => {
  const { userId } = useParams();
  const location = useLocation();
  const state = location.state || {};
  const loggedInUserId = state.loggedInUserId;
  const [authError, setAuthError] = useState(false);
  const navigate = useNavigate();

  const handleNewInteraction = () => {
    navigate("/newsubmission", {
      state: { selectedUser: userId, userId: loggedInUserId },
    });
  };

  const handleBackToMessagesClick = () => {
    navigate("/userlist", { state: { userId: loggedInUserId } });
  };

  const [user, setUser] = useState(null);

  useEffect(() => {
    // Authorization check
    if (loggedInUserId) {
      checkAuthorization(loggedInUserId)
        .then((isAuthorized) => {
          if (!isAuthorized) {
            setAuthError(true); // Handle unauthorized access
            // Optionally, redirect the user
            // navigate("/login");
          } else {
            fetchUserProfile(); // Fetch user profile if authorized
          }
        });
    }
  }, [loggedInUserId, navigate]);

  const fetchUserProfile = () => {
    fetch(`/api/users/${userId}`)
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error("Error fetching user:", error));
  };

  if (authError) {
    return (
      <div>Unauthorized access. Please <a href="/">log in</a>.</div>
    );
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Button variant="outline-info" className="btn-sm back-button" onClick={handleBackToMessagesClick}>
        Back to messages
      </Button>
      <div className="profile-container">
        <h2>{user.username}'s Profile</h2>
        <p>Email: {user.email}</p>
        <Button variant="outline-info" className="btn-sm" onClick={handleNewInteraction}>
          New Submission
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
