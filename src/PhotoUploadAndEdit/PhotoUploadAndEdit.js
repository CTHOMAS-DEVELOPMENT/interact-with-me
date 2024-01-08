import React, { useState } from 'react';

const PhotoUploadAndEdit = ({ userId, onPhotoSubmit }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
  
    const handleFileChange = (event) => {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setIsEditing(true);
      }
    };
  
    const handleSave = () => {
      const formData = new FormData();
      formData.append('file', selectedFile);
  
      fetch(`/api/users/${userId}/uploaded-item`, {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        console.log('Upload successful', data);
        if (onPhotoSubmit) {
          onPhotoSubmit(); // Trigger the callback to re-fetch posts
        }
        // Clear the image preview and reset editing state
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsEditing(false);
      })
      .catch(error => {
        console.error('Upload error:', error);
      });
    };
  
    return (
      <div className="photo-upload-edit">
        {!isEditing && (
          <div>
            <input type="file" onChange={handleFileChange} accept="image/*" />
          </div>
        )}
  
        {previewUrl && isEditing && (
          <div>
            <img src={previewUrl} alt="Preview" />
            <button onClick={handleSave}>Save</button>
          </div>
        )}
      </div>
    );
  };
  
  export default PhotoUploadAndEdit;
  