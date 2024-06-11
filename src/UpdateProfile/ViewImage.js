import React, { useState, useEffect } from "react";
import ImageUploader from "../RegistrationProfileCreation/imageUploader";
import LoadAVideo from "../Video/LoadAVideo";
import { convertToMediaPath } from "../system/utils";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const ViewImage = ({ userId, profileVideo = "", profileImage = "" }) => {
  const [profilePicture, setProfilePicture] = useState(profileImage);
  const [showUploader, setShowUploader] = useState(false);
  const [showVideoUploader, setShowVideoUploader] = useState(false);
  const [videoPath, setVideoPath] = useState(profileVideo);

  // Update profilePicture when profileImage prop changes
  useEffect(() => {
    if (profileImage) {
      setProfilePicture(profileImage);
    }
  }, [profileImage]);

  // Update videoPath when profileVideo prop changes
  useEffect(() => {
    if (profileVideo) {
      setVideoPath(profileVideo);
    }
  }, [profileVideo]);

  const handleProfileVideo = () => {
    setShowVideoUploader(!showVideoUploader);
  };

  const handleProfilePictureUpdate = () => {
    setShowUploader(true);
  };

  const handleCloseUploader = () => {
    setShowUploader(false);
  };

  const handleCloseVideoUploader = () => {
    setShowVideoUploader(false);
  };

  const handleUploadSuccess = (newProfilePicture) => {
    const updatedProfilePicture = `${
      process.env.REACT_APP_IMAGE_HOST
    }/uploaded-images/${newProfilePicture
      .split("\\")
      .pop()}?timestamp=${new Date().getTime()}`;
    setProfilePicture(updatedProfilePicture);
    handleCloseUploader();
  };

  const handleVideoUploadSuccess = (data) => {
    setVideoPath(convertToMediaPath(data.user.profile_video));
    handleCloseVideoUploader();
  };

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
          <Button
            variant="outline-info"
            className="btn-sm"
            onClick={handleProfileVideo}
          >
            {videoPath ? "Update Profile Video (Max 30 seconds)" : "Add Profile Video (Max 30 seconds)"}
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
      {videoPath && (
        <div>
          <video src={videoPath} controls style={{ width: "80%" }} />{" "}
          {/* Adjust width as necessary */}
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
      <Modal show={showVideoUploader} onHide={handleCloseVideoUploader}>
        <Modal.Header closeButton>
          <Modal.Title>
            {videoPath ? "Update Profile Video" : "Add Profile Video"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <LoadAVideo userId={userId} onUpload={handleVideoUploadSuccess} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ViewImage;
