import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PhotoUploadAndEdit from "../PhotoUploadAndEdit/PhotoUploadAndEdit";
import TextEntry from "../TextEntry/TextEntry";
const FeedScreen = () => {
  const [posts, setPosts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state ? location.state.userId : null;
  const submissionId = location.state ? location.state.submissionId : null;
  const title = location.state ? location.state.title : null;
  console.log("FeedScreen-userId", userId);
  const handleBackToMessagesClick = () => {
    navigate("/userlist", { state: { userId: userId } }); // Update for v6
  };
  const fetchPosts = () => {
    if (submissionId) {
      fetch(`/api/users/${submissionId}/posts`)
        .then((response) => response.json())
        .then((data) => {
          return setPosts(data);
        })
        .catch((error) => console.error("Error fetching posts:", error));
    }
  };

  useEffect(() => {
    if (submissionId) {
      fetchPosts();
    }
  }, [submissionId]);
  return (
    <div className="feed-screen">
      <button onClick={handleBackToMessagesClick}>Back to messages</button>{" "}
      <h2>{title}</h2>
      {submissionId && (
        <>
          <TextEntry
            userId={userId}
            submissionId={submissionId}
            onPostSubmit={fetchPosts}
          />
          <PhotoUploadAndEdit
            userId={userId}
            submissionId={submissionId}
            onPhotoSubmit={fetchPosts}
          />
        </>
      )}
      {/* List of combined posts *New**/}
      {posts.map((post) => (
        <div key={post.id} className="post">
          {post.type === "text" ? (
            <p>{post.username + " " + post.content}</p>
          ) : (
            <>
              <p>{post.username}</p>
              <img
                src={`${process.env.REACT_APP_IMAGE_HOST}${post.uploaded_path}`}
                alt="User Post"
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default FeedScreen;
