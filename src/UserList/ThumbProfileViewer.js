import React, { useState, useEffect } from "react";
import {getThumbnailPath} from "../system/utils"

import "bootstrap/dist/css/bootstrap.min.css";

const ProfileViewer = ({ userId }) => {
  const [profilePicture, setProfilePicture] = useState(null);
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/profile-picture`);
        
        if (!response.ok) throw new Error("Failed to fetch profile picture");
        const data = await response.json();
        const thumbImage = getThumbnailPath(data.profilePicture);
        setProfilePicture(thumbImage);
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    fetchProfilePicture();
  }, [userId]);


  useEffect(() => {
    // This effect will run when `profilePicture` changes.
    // It's mainly for debugging to see if `profilePicture` is properly updated.
  }, [profilePicture]);
  return (
    <div className="profile-picture-container">
      {profilePicture ? (
        <img src={profilePicture} alt="Profile" />
      ) : (
        <span>No image</span>
      )}
    </div>
  );
};

export default ProfileViewer;
