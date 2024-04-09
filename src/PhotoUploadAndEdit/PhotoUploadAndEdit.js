import React, { useState } from "react";
import Resizer from "react-image-file-resizer";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const PhotoUploadAndEdit = ({
  userId,
  submissionId,
  onPhotoSubmit,
  onSaveSuccess,
  dialogId,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fileName, setFileName] = useState(""); // State to hold the file name
  const resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        400, // maxWidth
        400, // Adjust maxHeight as needed to maintain aspect ratio
        "JPEG", // compressFormat
        100, // quality
        0, // rotation
        (uri) => {
          resolve(uri);
        },
        "file" // Output as file blob
      );
    });
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      resizeFile(file).then((resizedImage) => {
        setSelectedFile(resizedImage);
        setPreviewUrl(URL.createObjectURL(resizedImage));
      });
      setIsEditing(true);
      setFileName(file.name);
    }
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    if (userId) formData.append("userId", userId);

    let apiEndpoint = "/api/users/uploaded-item";
    if (submissionId) apiEndpoint = `/api/users/${submissionId}/uploaded-item`;
    if (dialogId)
      apiEndpoint = `/api/submission-dialog/${dialogId}/update-item`;

    fetch(apiEndpoint, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (onPhotoSubmit) onPhotoSubmit();
        if (onSaveSuccess) onSaveSuccess();
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsEditing(false);
      })
      .catch((error) => console.error("Upload error:", error));
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
          {fileName && <div className="file-upload-filename">{fileName}</div>}
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
