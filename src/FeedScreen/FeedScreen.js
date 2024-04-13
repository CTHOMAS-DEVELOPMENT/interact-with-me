import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import PhotoUploadAndEdit from "../PhotoUploadAndEdit/PhotoUploadAndEdit";
import TextUpdate from "../TextEntry/TextUpdate";
import TextEntry from "../TextEntry/TextEntry";
import { extractFilename, getThumbnailPath } from "../system/utils";
import { Button } from "react-bootstrap";
import {
  ArrowLeftCircleFill,
  Search,
  Image,
  ImageFill,
  Trash,
  TrashFill,
} from "react-bootstrap-icons";

import "bootstrap/dist/css/bootstrap.min.css";
import { checkAuthorization } from "../system/authService";
const FeedScreen = () => {
  const [showUploader, setShowUploader] = useState(false);
  const [showTextUpdate, setShowTextUpdate] = useState(false);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [posts, setPosts] = useState([]);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [dialogId, setDialogId] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(""); // Initialize as empty string
  const [hoveredDeletePostId, setHoveredDeletePostId] = useState(null);
  const [searchActive, setSearchActive] = useState(false);
  const [userIsLive, setUserIsLive] = useState(false); // New state for tracking live updates for involved users
  const [associatedUsers, setAssociatedUsers] = useState([]);
  const [activeUsersList, setActiveUsersList] = useState([]);
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state ? location.state.userId : null;
  const submissionId = location.state ? location.state.submissionId : null;
  const title = location.state ? location.state.title : null;
  const handleBackToMessagesClick = () => {
    navigate("/userlist", { state: { userId: userId } }); // Update for v6
  };
  const [summary, setSummary] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const toggleSearch = () => {
    setSearchActive((prev) => !prev);
    // Focus on the input field when it becomes visible (after state update)
    if (!searchActive) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 0);
    }
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

  // useEffect to fetch associated users
  useEffect(() => {
    if (submissionId) {
      fetch(`/api/interaction_feed_user_list?submission_id=${submissionId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          // Filter out the current logged-in user from the list
          const filteredUsers = data.filter((user) => user.id !== userId);
          setAssociatedUsers(filteredUsers);
        })
        .catch((error) => {
          console.error("Error fetching associated users:", error);
        });
    }
  }, [submissionId, userId]);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_BACKEND_HOST);

    socket.on("connect", () => {
      socket.emit("register", { userId, submissionIds: [submissionId] }); // Ensure this is needed
      socket.emit("enter screen", { userId, submissionId });
    });

    // Update the associated users' active status when the active users update is received
    socket.on("active users update", (activeUsers) => {
      setActiveUsersList(activeUsers)
     });
    socket.on("post update", (newPost) => {
      const interestedUserIds = newPost.interestedUserIds;

      // Check if userId is in interestedUserIds and update userIsLive accordingly
      if (interestedUserIds.includes(parseInt(userId, 10))) {
        setUserIsLive(true);
      }
    });
    //setActiveUsersForSubmission(submissionId);
    return () => {
      socket.emit("leave screen", { userId, submissionId });
      socket.off("connect");
      socket.off("active users update");
      socket.off("post update");
      socket.disconnect();
    };
  }, [submissionId, userId]); // Depend on submissionId and userId to re-register on changes

  useEffect(() => {
    if (userIsLive) {
      // Refresh dialog or posts when userIsLive is true
      fetchPosts();
      // Reset userIsLive after the update
      setUserIsLive(false);
    }
  }, [userIsLive]);

  useEffect(() => {
    if (posts.length > 0) {
      // Combine all post content into one large block of text
      const fullText = posts.map((post) => post.content).join(" ");
      fetchSummary(fullText);
    }
  }, [posts]);
  useEffect(() => {
    if (userId) {
      fetch(`/api/users/${userId}/profile-picture`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.profilePicture) {
            const thumbnailPath = getThumbnailPath(data.profilePicture);
            setUserProfilePic(thumbnailPath);
          }
        })
        .catch((error) => {
          console.error("Error fetching user profile picture:", error);
        });
    }
  }, [userId]);
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

  const handleGetNewPicture = () => {
    setShowUploader(true); // Show the uploader
  };
  const handleCloseUploader = () => {
    setShowUploader(false); // This will hide the modal
  };
  const setPostIdForText = (id, text) => {
    setDialogId(id);
    setCurrentText(text);
    setShowTextUpdate(true);
  };
  const setPostId = (id) => {
    setDialogId(id);
    handleGetNewPicture();
  };
  // Call this when the text update is successful to hide the TextUpdate component
  const handleTextSaveSuccess = () => {
    setShowTextUpdate(false);
    fetchPosts(); // Refresh the posts
  };
  const filteredPosts =
    searchQuery.length >= 3
      ? posts.filter(
          (post) =>
            post.content &&
            post.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : posts;

  useEffect(() => {
    if (userId) {
      checkAuthorization(userId).then((isAuthorized) => {
        if (!isAuthorized) {
          setAuthError(true);
          // Optionally, you can also navigate the user to a login page or display a modal asking them to log in.
          // navigate("/");
        }
      });
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (submissionId) {
      fetchPosts();
    }
  }, [submissionId]);
  useEffect(() => {
    // Add the class to body
    document.body.classList.add("feed-displacement");

    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.classList.remove("feed-displacement");
    };
  }, []);
  if (authError) {
    // You could also use navigate("/login") here if you prefer redirection over rendering a message
    return (
      <div className="unauthorized-access">
        Unauthorized access. Please <a href="/">log in</a>.
      </div>
    );
  }
const checkUserIsInActiveList=(user_id, activeUsersList)=>{

  return activeUsersList.includes(user_id)?"active":""
}
  return (
    <div>
      {" "}
      {/* This wraps the entire screen */}
      <div className="header">
        <div className="header-top">
          <Button
            variant="outline-info"
            className="btn-icon"
            onClick={() => {
              handleBackToMessagesClick();
            }}
          >
            <ArrowLeftCircleFill size={25} />
          </Button>
          <div
            className="interaction-icons"
            onClick={() => {
              handleBackToMessagesClick();
            }}
          >
            <div className="interaction-icons">
              {associatedUsers.map((user) => (
                <img
                  key={user.id}
                  src={`${process.env.REACT_APP_IMAGE_HOST}/${
                    process.env.REACT_APP_IMAGE_FOLDER
                  }/thumb-${extractFilename(user.profile_picture)}`}
                  alt={user.username}
                  className={`post-profile-image ${
                    checkUserIsInActiveList(user.id, activeUsersList)
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="search-container">
            <Button
              variant="outline-info" // This should match other buttons
              className="btn-icon" // Make sure it has the same classes
              onClick={toggleSearch}
            >
              <Search size={25} />
            </Button>
            {searchActive && (
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="Type your search"
                onChange={handleSearchChange}
              />
            )}
          </div>
        </div>
        <h2 className="header-title font-style-4">{title}</h2>
      </div>
      {submissionId && (
        <>
          {showTextUpdate && (
            <div
              className="feed-content modal-backdrop"
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
            {userProfilePic && (
              <img
                src={userProfilePic}
                alt="Current User Profile"
                className="current-user-profile-pic"
              />
            )}

            <div className="text-entry-container">
              <TextEntry
                userId={userId}
                submissionId={submissionId}
                onPostSubmit={fetchPosts}
              />
            </div>
            <Button
              variant="outline-info"
              className="btn-icon btn-delete"
              onMouseEnter={() => setIsImageHovered(true)}
              onMouseLeave={() => setIsImageHovered(false)}
              onClick={handleGetNewPicture}
            >
              {isImageHovered ? <ImageFill size={25} /> : <Image size={25} />}
            </Button>
          </div>
        </>
      )}
      {/* List of combined posts *New**/}
      {filteredPosts.map((post) => (
        <div key={post.id} className="element-group-box">
          <img
            src={`${process.env.REACT_APP_IMAGE_HOST}/${
              process.env.REACT_APP_IMAGE_FOLDER
            }/thumb-${extractFilename(post.profile_picture)}`}
            alt="User Post"
            className="post-profile-image"
          />

          {post.type === "text" ? (
            <div className="speech-bubble">
              <div>{post.content}</div>
            </div>
          ) : (
            <div className="post-image-container">
              <img
                className={
                  userId === post.posting_user_id ? "resizable-image" : ""
                }
                src={`${process.env.REACT_APP_IMAGE_HOST}${post.uploaded_path}`}
                alt="User Post"
              />
            </div>
          )}

          {userId === post.posting_user_id && (
            <div className="button_tower">
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
                onMouseEnter={() => setHoveredDeletePostId(post.id)}
                onMouseLeave={() => setHoveredDeletePostId(null)}
              >
                {hoveredDeletePostId === post.id ? (
                  <TrashFill size={25} />
                ) : (
                  <Trash size={25} />
                )}
              </Button>
            </div>
          )}
          {userId !== post.posting_user_id && (
            <div className="button_tower" style={{ opacity: 0.5 }}>
              <Button variant="outline-info" className="btn-sm" disabled>
                Update
              </Button>

              <Button variant="danger" className="btn-sm" disabled>
                <Trash size={25} />
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
