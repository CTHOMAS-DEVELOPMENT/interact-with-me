import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PhotoUploadAndEdit from "../PhotoUploadAndEdit/PhotoUploadAndEdit";
import TextEntry from "../TextEntry/TextEntry";
const FeedScreen = () => {
  const [posts, setPosts] = useState([]);
  const location = useLocation();
  const userId = location.state ? location.state.userId : null;
  const selectedUser = location.state ? location.state.selectedUser : null;
  console.log("FeedScreen-selectedUser",selectedUser)
  console.log("FeedScreen-userId",userId)
  //A new Interaction must have user_id INTEGER NOT NULL, interaction_id INTEGER NOT NULL, name VARCHAR(255)
  //This screen is blank and at the start of a message with a title
  const fetchPosts = () => {
    if (userId) {
      fetch(`/api/users/${userId}/posts`)
        .then((response) => response.json())
        .then((data) => setPosts(data))
        .catch((error) => console.error("Error fetching posts:", error));
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPosts();
    }
  }, [userId]);
  return (
    <div className="feed-screen">
      <h2>User Feed</h2>
      {userId && (
        <>
          <TextEntry userId={userId} onPostSubmit={fetchPosts} />
          <PhotoUploadAndEdit userId={userId} onPhotoSubmit={fetchPosts} />
        </>
      )}
      {/* List of combined posts *New**/}
      {posts.map((post) => (
        <div key={post.id} className="post">
          {post.type === "text" ? (
            <p>{post.content}</p>
          ) : (
            <img src={`${process.env.REACT_APP_IMAGE_HOST}${post.content}`} alt="User Post" />
          )}
        </div>
      ))}
    </div>
  );
};

export default FeedScreen;
