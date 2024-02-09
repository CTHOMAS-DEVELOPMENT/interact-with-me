import React, { useState } from "react";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const PhotoUploadAndEdit = ({ userId, submissionId, onPhotoSubmit }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsEditing(true);
      // Update the label with the file name
      document.getElementById("file-upload-filename").textContent = file.name;
    }
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", userId);
    fetch(`/api/users/${submissionId}/uploaded-item`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (onPhotoSubmit) {
          onPhotoSubmit(); // Trigger the callback to re-fetch posts
        }
        // Clear the image preview and reset editing state
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Upload error:", error);
      });
  };

  return (
    <div className="photo-upload-edit">
      {!isEditing && (
        <>
          <input
            type="file"
            id="fileUpload"
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept="image/*"
          />
          <label htmlFor="fileUpload" className="btn btn-outline-info btn-sm">
            Choose File
          </label>
          <span id="file-upload-filename" className="file-upload-filename">
            No file chosen
          </span>
        </>
      )}

      {previewUrl && isEditing && (
        <div>
          <img src={previewUrl} alt="Preview" />
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadAndEdit;
