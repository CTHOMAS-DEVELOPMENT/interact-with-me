import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ViewImage from "../UpdateProfile/ViewImage";
import ProfileViewer from "./ProfileViewer"
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
  useEffect(() => {
    console.log("UP user",user)
    /**
     {
    "id": 59,
    "username": "DollopOfCream",
    "email": "DollopOfCream@gmail.com",
    "profile_picture": "backend\\imageUploaded\\file-1709892884317.JPEG",
    "sexual_orientation": "Homosexual",
    "hobbies": "Education",
    "floats_my_boat": "Other (Not Listed)",
    "sex": null
}
     */
  },[user])
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh', // Use full viewport height
    }}>
      <Button variant="outline-info" className="btn-sm back-button" onClick={handleBackToMessagesClick}>
        Back to messages
      </Button>
      <div className="profile-container" style={{ textAlign: 'center' }}>
        <h2>{user.username}'s Profile</h2>
        <ProfileViewer userId={userId} />
        <p><b>Sexual Orientation</b>: {user.sexual_orientation}</p>
        <p><b>Hobbies</b>: {user.hobbies}</p>
        <p><b>Floats my boat</b>: {user.floats_my_boat}</p>
        <p><b>Sex</b>: {user.sex ? user.sex : "No entry"}</p>

        <Button variant="outline-info" className="btn-sm" onClick={handleNewInteraction}>
          New Submission
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
