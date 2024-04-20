import React, { useState } from 'react';

const LoadAVideo = ({ userId, onUpload }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoError, setVideoError] = useState('');

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.match('video.*')) {
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = function() {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            setVideoError('Video is longer than 30 seconds.');
            setSelectedVideo(null);
          } else {
            setVideoError('');
            setSelectedVideo(file);
          }
        };

        video.src = URL.createObjectURL(file);
      } else {
        setVideoError('Please select a valid video file.');
        setSelectedVideo(null);
      }
    }
  };

  const handleVideoUpload = async () => {
    if (selectedVideo) {
      const formData = new FormData();
      formData.append('profileVideo', selectedVideo);

      try {
        const response = await fetch(`/api/users/${userId}/upload-profile-video`, {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          onUpload(data); // Trigger the onUpload callback with the response
        } else {
          setVideoError('Failed to upload video. Please try again.');
        }
      } catch (error) {
        console.error('Error uploading video:', error);
        setVideoError('An error occurred while uploading the video.');
      }
    }
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleVideoChange} />
      {videoError && <p>{videoError}</p>}
      {selectedVideo && (
        <>
          <video src={URL.createObjectURL(selectedVideo)} controls style={{ width: '100%' }} />
          <button onClick={handleVideoUpload}>Upload Video</button>
        </>
      )}
    </div>
  );
};

export default LoadAVideo;
