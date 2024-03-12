import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PhotoUploadAndEdit from "../PhotoUploadAndEdit/PhotoUploadAndEdit";
import TextUpdate from "../TextEntry/TextUpdate";
import TextEntry from "../TextEntry/TextEntry";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
const FeedScreen = () => {
  const [showUploader, setShowUploader] = useState(false);
  const [showTextUpdate, setShowTextUpdate] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [posts, setPosts] = useState([]);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [dialogId, setDialogId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state ? location.state.userId : null;
  const submissionId = location.state ? location.state.submissionId : null;
  const title = location.state ? location.state.title : null;
  const handleBackToMessagesClick = () => {
    navigate("/userlist", { state: { userId: userId } }); // Update for v6
  };
  const [summary, setSummary] = useState("");

  // Toggle modal visibility
  // Function to fetch summary
  const fetchSummary = (fullText) => {
    setIsSummaryLoading(true); // Start loading
    fetch("/api/summarize-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: fullText }),
    })
      .then((response) => response.json())
      .then((data) => {
        setSummary(data.summary);
        setIsSummaryLoading(false); // Stop loading once the data is received
      })
      .catch((error) => {
        console.error("Error fetching summary:", error);
        setIsSummaryLoading(false); // Stop loading if there's an error
      });
  };

  // Call this function whenever you need to update the summary
  // For example, you can call it right after fetchPosts() inside useEffect
  const deletePost = async (postId) => {
    try {
      const response = await fetch(`/api/submission-dialog/${postId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        // If the deletion was successful, fetch the posts again to update the UI
        fetchPosts();
      } else {
        console.error("Failed to delete the post.");
      }
    } catch (error) {
      console.error("Error deleting the post:", error);
    }
  };

  useEffect(() => {
    if (posts.length > 0) {
      // Combine all post content into one large block of text
      const fullText = posts.map((post) => post.content).join(" ");
      fetchSummary(fullText);
    }
  }, [posts]);
  const fetchPosts = () => {
    if (submissionId) {
      fetch(`/api/users/${submissionId}/posts`)
        .then((response) => response.json())
        .then((data) => {
          console.log("data", data);
          return setPosts(data);
        })
        .catch((error) => console.error("Error fetching posts:", error));
    }
  };
  const handleShowTextUpdate = (text, id) => {
    setCurrentText(text);
    setDialogId(id);
    setShowTextUpdate(true); // Show TextUpdate component
  };
  const handleGetNewPicture = () => {
    // Navigate to profile picture update page or open a modal for updating the profile picture
    // This is a placeholder action and should be replaced with actual logic
    //console.log("Update profile picture button clicked");
    setShowUploader(true); // Show the uploader
  };
  const handleCloseUploader = () => {
    setShowUploader(false); // This will hide the modal
  };
  const setPostIdForText = (id, text) => {
    console.log("DialogId For Text", id);
    setDialogId(id);
    setCurrentText(text);
    setShowTextUpdate(true);
  };
  const setPostId = (id) => {
    console.log("DialogId", id);
    setDialogId(id);
    handleGetNewPicture();
  };
  // Call this when the text update is successful to hide the TextUpdate component
  const handleTextSaveSuccess = () => {
    setShowTextUpdate(false);
    fetchPosts(); // Refresh the posts
  };
  useEffect(() => {
    if (submissionId) {
      fetchPosts();
    }
  }, [submissionId]);
  return (
    <div className="feed-screen">
      <Button
        variant="outline-info"
        className="btn-sm"
        onClick={handleBackToMessagesClick}
      >
        Back to messages
      </Button>{" "}
      <h2>{title}</h2>
      {submissionId && (
        <>
          {showTextUpdate && (
            <div
              className="modal-backdrop"
              onClick={() => setShowTextUpdate(false)}
            >
              <div
                className="text-update-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <TextUpdate
                  dialogId={dialogId}
                  initialText={currentText}
                  onSaveSuccess={handleTextSaveSuccess}
                />
              </div>
            </div>
          )}

          {showUploader && (
            <div className="backdrop" onClick={handleCloseUploader}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <PhotoUploadAndEdit
                  userId={userId}
                  submissionId={submissionId}
                  onPhotoSubmit={fetchPosts}
                  onSaveSuccess={() => setShowUploader(false)}
                  dialogId={dialogId}
                />
              </div>
            </div>
          )}
          <div className="element-group-box">
            <TextEntry
              userId={userId}
              submissionId={submissionId}
              onPostSubmit={fetchPosts}
            />
            <Button
              variant="outline-info"
              className="btn-sm"
              onClick={handleGetNewPicture}
            >
              Add Image
            </Button>
          </div>
        </>
      )}
      {/* List of combined posts *New**/}
      {posts.map((post) => (
        <div key={post.id} className="element-group-box">
          {post.type === "text" ? (
            <div>
              <div>{post.username}</div>
              <div>{post.content}</div>
            </div>
          ) : (
            <div>
              <div>{post.username}</div>
              <img
                src={`${process.env.REACT_APP_IMAGE_HOST}${post.uploaded_path}`}
                alt="User Post"
              />
            </div>
          )}
          {userId === post.posting_user_id && (
            <div>
              {post.type === "text" ? (
                <Button
                  variant="outline-info"
                  className="btn-sm"
                  onClick={() => {
                    setPostIdForText(post.id, post.content);
                  }}
                >
                  Update
                </Button>
              ) : (
                <Button
                  variant="outline-info"
                  className="btn-sm"
                  onClick={() => {
                    setPostId(post.id);
                  }}
                >
                  Update
                </Button>
              )}
              <Button
                variant="danger"
                className="btn-sm"
                onClick={() => deletePost(post.id)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      ))}
      <h2>Summary</h2>
      <div className="summary-container element-group-box">
        {isSummaryLoading ? "Summary is coming, please wait..." : summary}
      </div>{" "}
    </div>
  );
};

export default FeedScreen;
