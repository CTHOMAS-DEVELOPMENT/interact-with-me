import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PhotoUploadAndEdit from "../PhotoUploadAndEdit/PhotoUploadAndEdit";
import TextEntry from "../TextEntry/TextEntry";
const FeedScreen = () => {
  const [posts, setPosts] = useState([]);
  const location = useLocation();
  const userId = location.state ? location.state.userId : null;
  const selectedUser = location.state ? location.state.selectedUser : null;
  const selectedUserIds = location.state ? location.state.selectedUserIds : null;
  const submissionId = location.state ? location.state.submissionId : null;
  const title = location.state ? location.state.title : null;
  console.log("2.Selected User IDs:", selectedUserIds);
  console.log("FeedScreen-selectedUser",selectedUser)
  console.log("FeedScreen-userId",userId)
  console.log("FeedScreen-submissionId",submissionId)
  console.log("FeedScreen-title",title)
  //A new Interaction must have user_id INTEGER NOT NULL, interaction_id INTEGER NOT NULL, name VARCHAR(255)
  //This screen is blank and at the start of a message with a title
  const fetchPosts = () => {
    if (submissionId) {
      fetch(`/api/users/${submissionId}/posts`)
        .then((response) => response.json())
        .then((data) => setPosts(data))
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
      <h2>{ title }</h2>
      {submissionId && (
        <>
          <TextEntry userId={userId} submissionId={submissionId} onPostSubmit={fetchPosts} />
          <PhotoUploadAndEdit userId={userId} submissionId={submissionId} onPhotoSubmit={fetchPosts} />
        </>
      )}
      {/* List of combined posts *New**/}
      {posts.map((post) => (
        <div key={post.id} className="post">
          {post.type === "text" ? (
            <p>{post.content}</p>
          ) : (
            <img src={`${process.env.REACT_APP_IMAGE_HOST}${post.uploaded_path}`} alt="User Post" />
          )}
        </div>
      ))}
    </div>
  );
};

export default FeedScreen;
