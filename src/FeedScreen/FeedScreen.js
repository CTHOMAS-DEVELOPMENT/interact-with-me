import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PhotoUploadAndEdit from "../PhotoUploadAndEdit/PhotoUploadAndEdit";
import TextEntry from "../TextEntry/TextEntry";
const FeedScreen = () => {
  const [posts, setPosts] = useState([]);
  const location = useLocation();
  const userId = location.state ? location.state.userId : null;
  const fetchPosts = () => {
    if (userId) {
      fetch(`/api/users/${userId}/posts`)
        .then((response) => response.json())
        .then((data) => setPosts(data))
        .catch((error) => console.error("Error fetching posts:", error));
    }
  };
//   useEffect(() => {
//     // Fetch combined posts using the userId
//     if (userId) {
//       fetch(`/api/users/${userId}/posts`)
//         .then((response) => response.json())
//         .then((data) => setPosts(data))
//         .catch((error) => console.error("Error fetching posts:", error));
//     }
//   }, [userId]);
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
          <PhotoUploadAndEdit userId={userId} />
        </>
      )}
      {/* List of combined posts *New**/}
      {posts.map((post) => (
        <div key={post.id} className="post">
          {post.type === "text" ? (
            <p>{post.content}</p>
          ) : (
            <img src={`http://localhost:3002${post.content}`} alt="User Post" />
          )}
        </div>
      ))}
    </div>
  );
};

export default FeedScreen;
