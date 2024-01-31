import React, { useState } from "react";

const ImageUploader = ({ userId, onUpload }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!file) {
      console.error("No file selected");
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file); // 'file' is the key multer will look for
  
    try {
      const response = await fetch(`/api/users/${userId}/profile-picture`, {
        method: "POST",
        body: formData, // Send formData, not JSON
        // Do not set Content-Type header, let the browser set it
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      if (onUpload) {
        onUpload(data.profile_picture);
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };  

  return (
    <div className="image-uploader">
      <h2>Upload a Picture for Your Profile</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <input type="file" onChange={handleFileChange} className="file-input" />
        <button type="submit" className="submit-button">
          Upload Image
        </button>
      </form>
    </div>
  );
};

export default ImageUploader;
