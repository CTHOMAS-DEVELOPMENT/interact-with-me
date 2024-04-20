import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ProfileViewer from "./ProfileViewer";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { checkAuthorization } from "../system/authService";
import { convertToMediaPath } from "../system/utils"

const UserProfile = () => {
  const { userId } = useParams();
  const location = useLocation();
  const state = location.state || {};
  const loggedInUserId = state.loggedInUserId;
  const [authError, setAuthError] = useState(false);
  const [showVideo, setShowVideo] = useState(false);  // State to manage video visibility
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const handleNewInteraction = () => {
    navigate("/newsubmission", {
      state: { selectedUser: userId, userId: loggedInUserId },
    });
  };

  const handleVideoDisplay = () => {
    setShowVideo(!showVideo);  // Toggle video display and hide ProfileViewer
  };

  const handleBackToMessagesClick = () => {
    navigate("/userlist", { state: { userId: loggedInUserId } });
  };

  useEffect(() => {
    if (loggedInUserId) {
      checkAuthorization(loggedInUserId).then((isAuthorized) => {
        if (!isAuthorized) {
          setAuthError(true);
        } else {
          fetchUserProfile();
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
      <div>
        Unauthorized access. Please <a href="/">log in</a>.
      </div>
    );
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Button
        variant="outline-info"
        className="btn-sm back-button"
        onClick={handleBackToMessagesClick}
      >
        Back to messages
      </Button>
      <div className="profile-container" style={{ textAlign: "center" }}>
        <h2>{user.username}'s Profile</h2>
        {user.profile_video && (
          <Button
            variant="outline-info"
            className="btn-sm"
            onClick={handleVideoDisplay}
          >
            {showVideo ? "Hide Video" : "Show Video"}
          </Button>
        )}
        {showVideo && user.profile_video && (
          <video src={convertToMediaPath(user.profile_video)} controls style={{ width: '100%', maxWidth: '500px' }} />
        )}
        {!showVideo && <ProfileViewer userId={userId} />} 
        <p><b>Sexual Orientation</b>: {user.sexual_orientation}</p>
        <p><b>Hobbies</b>: {user.hobbies}</p>
        <p><b>Floats my boat</b>: {user.floats_my_boat}</p>
        <p><b>Sex</b>: {user.sex ? user.sex : "No entry"}</p>
        <Button
          variant="outline-info"
          className="btn-sm"
          onClick={handleNewInteraction}
        >
          New Submission
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
