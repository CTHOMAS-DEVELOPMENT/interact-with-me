import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ProfileViewer from "./ProfileViewer";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { checkAuthorization } from "../system/authService";
import { convertToMediaPath } from "../system/utils";
import {
  version1Orientations,
  version1Gender,
  version1Hobbies,
  version1Keys,
} from "../RegistrationProfileCreation/scopedCollections";
import FloatsMyBoat from "../RegistrationProfileCreation/FloatsMyBoat.js";
import Gender from "../RegistrationProfileCreation/Gender.js";
import Orientation from "../RegistrationProfileCreation/Orientation.js";
import Hobbies from "../RegistrationProfileCreation/Hobbies.js";
const UserProfile = () => {
  const { userId } = useParams();
  const location = useLocation();
  const state = location.state || {};
  const loggedInUserId = state.loggedInUserId;
  const [authError, setAuthError] = useState(false);
  const [showVideo, setShowVideo] = useState(false); // State to manage video visibility
  const [selectedCarousel, setSelectedCarousel] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedOrientation, setSelectedOrientation] = useState(null);
  const [selectedHobby, setSelectedHobby] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const getIndexOfValue = (arrayOf, value) => {
    return arrayOf.indexOf(value);
  };
  const handleNewInteraction = () => {
    navigate("/newsubmission", {
      state: { selectedUser: userId, userId: loggedInUserId },
    });
  };

  const handleVideoDisplay = () => {
    setShowVideo(!showVideo); // Toggle video display and hide ProfileViewer
  };

  const handleBackToMessagesClick = () => {
    navigate("/userlist", { state: { userId: loggedInUserId } });
  };

  useEffect(() => {
    if (user) {
      setSelectedGender(getIndexOfValue(version1Gender, user.sex));
      setSelectedOrientation(
        getIndexOfValue(version1Orientations, user.sexual_orientation)
      );
      setSelectedHobby(getIndexOfValue(version1Hobbies, user.hobbies));
      setSelectedCarousel(getIndexOfValue(version1Keys, user.floats_my_boat));
    }
  }, [user]);
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
        <h2 className="font-style-4">{user.username}'s Profile</h2>
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
          <video
            src={convertToMediaPath(user.profile_video)}
            controls
            style={{ width: "100%", maxWidth: "500px" }}
          />
        )}
        {!showVideo && <ProfileViewer userId={userId} />}
        <p style={{marginTop:"20px"}} className="font-style-4">{user.username}'s Preferred Company Selection</p>
        <Orientation
          onSelectOrientation={() => {}}
          selected={selectedOrientation}
        />
        <p className="font-style-4">{user.username}'s Favourite Hobby Selection</p>
        <Hobbies onSelectHobby={() => {}} selected={selectedHobby} />
        <p className="font-style-4">{user.username}'s Floats Your Boat Selection</p>
        <FloatsMyBoat
          onSelectCarousel={() => {}}
          selectedCarousel={selectedCarousel}
        />
        <p className="font-style-4">{user.username}'s Most Like You Selection</p>
        <Gender onSelectGender={() => {}} selected={selectedGender} />
        <p className="font-style-4">{user.username}'s about you</p>
        <textarea readOnly className="about-you-textarea">{user.about_you?user.about_you:user.username + " has not entered anything yet.."}</textarea>
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
