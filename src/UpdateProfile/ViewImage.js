import React, { useState, useEffect } from "react";
import ImageUploader from "../RegistrationProfileCreation/imageUploader";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
const ViewImage = ({ userId }) => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [showUploader, setShowUploader] = useState(false); // State to control the display of ImageUploader

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/profile-picture`);
        //console.log("response", response);
        if (!response.ok) throw new Error("Failed to fetch profile picture");
        const data = await response.json();
        setProfilePicture(data.profilePicture);
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    fetchProfilePicture();
  }, [userId]);
  const handleProfilePictureUpdate = () => {
    // Navigate to profile picture update page or open a modal for updating the profile picture
    // This is a placeholder action and should be replaced with actual logic
    //console.log("Update profile picture button clicked");
    setShowUploader(true); // Show the uploader
  };
  const handleCloseUploader = () => {
    setShowUploader(false); // Hide the uploader
  };
  const handleUploadSuccess = (newProfilePicture) => {
    // Use the environment variable to construct the new image path with cache-busting
    const updatedProfilePicture = `${process.env.REACT_APP_IMAGE_HOST}/uploaded-images/${newProfilePicture.split("\\").pop()}?timestamp=${new Date().getTime()}`;
    setProfilePicture(updatedProfilePicture);
    handleCloseUploader();
  };
  useEffect(() => {
    // This effect will run when `profilePicture` changes.
    // It's mainly for debugging to see if `profilePicture` is properly updated.
    //console.log("(2)useEffect-newProfilePicture", profilePicture);
  }, [profilePicture]);
  return (
    <div className="profile-picture-container">
      {profilePicture ? (
        <div className="button-container">
          <img src={profilePicture} alt="Profile" />
          <Button
            variant="outline-info"
            className="btn-sm"
            onClick={handleProfilePictureUpdate}
          >
            Update Profile Image
          </Button>
        </div>
      ) : (
        <div className="button-container">
          <p>No profile picture</p>
          <Button
            variant="outline-info"
            className="btn-sm"
            onClick={handleProfilePictureUpdate}
          >
            Add a Profile Image
          </Button>
        </div>
      )}
      <Modal show={showUploader} onHide={handleCloseUploader}>
        <Modal.Header closeButton>
          <Modal.Title>Add/Update Profile Picture</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ImageUploader userId={userId} onUpload={handleUploadSuccess} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ViewImage;
