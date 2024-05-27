import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import JSZip from "jszip";
import { useLocation, useNavigate } from "react-router-dom";
import InteractionTitles from "../InteractionTitles/InteractionTitles";
import ThumbProfileViewer from "./ThumbProfileViewer";
import ConnectionRequests from "./ConnectionRequests";
import ConnectionRequested from "./ConnectionRequested";
import ScrollingHelpText from "../system/ScrollingHelpText";
import FilterUsers from "./FilterUsers";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Trash, TrashFill } from "react-bootstrap-icons";
import { checkAuthorization } from "../system/authService"; // Ensure the path is correct
const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [selectedUsernames, setSelectedUsernames] = useState([]);
  const [authError, setAuthError] = useState(false); // State for authorization error
  const [showFilter, setShowFilter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showConnectionRequests, setShowConnectionRequests] = useState(true); // State to toggle connection requests visibility
  const [showRequestsFromOthers, setShowRequestsFromOthers] = useState(true);
  const [hoveredContactToBeDeleted, setHoveredContactToBeDeleted] =
    useState(null);
  const [connectionRequests, setConnectionRequests] = useState(0);
  const [requestsFromOthers, setRequestsFromOthers] = useState(0);
  const [refreshNeeded, setRefreshNeeded] = useState(false);
  const [showMessage, setShowMessage] = useState(true);
  const [shouldRefreshInteractions, setShouldRefreshInteractions] =
    useState(false);

  const [activeTab, setActiveTab] = useState("Interactions");
  const [lastSelectedUserId, setLastSelectedUserId] = useState(null);
  const [notificationson, setNotificationsOn] = useState(false);//overide default

  const helpMessage =
    process.env.REACT_APP_COMMUNICATION_CENTRE_HELP ||
    "No help message configured.";
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInUserId = location.state ? location.state.userId : null;
  const toggleFilter = () => {
    setShowConnectionRequests(false);
    setShowFilter(!showFilter);
  };
  const deleteContactToBeDeleted = (id) => {
    fetch(`/api/delete-connection/${id}`, {
      method: "DELETE", // Use the DELETE HTTP method
    })
      .then((response) => {
        if (!response.ok) {
          // If the server response is not OK, throw an error
          throw new Error("Network response was not ok");
        }
        return response.json(); // Assuming the server responds with JSON
      })
      .then((data) => {
        fetchConnectedUsers(); // Refresh the list to reflect the deletion
      })
      .catch((error) => {
        console.error("Error deleting connection:", error);
        // Optionally, update your UI to indicate the error to the user
      });
  };
  const handleInteractionsTabClick = () => {
    setActiveTab("Interactions");
  };

  const handleCommunicationCentreTabClick = () => {
    setActiveTab("Communication Centre");
  };
  const applyFilter = (filterCriteria) => {
    if (!user.id) {
      console.error("No user ID provided for filtering.");
      return;
    }

    // Assuming `user.id` is the ID of the logged-in user you want to pass to your backend
    setIsSubmitting(true);
    fetch(`/api/filter-users/${user.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filterCriteria),
    })
      .then((response) => {
        if (!response.ok) {
          // If the server response is not OK, throw an error to catch it in the catch block
          throw new Error("Network response was not ok");
        }
        return response.json(); // Assuming the server responds with JSON
      })
      .then((data) => {
        // Handle the successful response here
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setShowConnectionRequests(true);
      })
      .catch((error) => {
        setIsSubmitting(false);
        setSubmitSuccess(false);
        console.error("Error applying filter:", error);
        // Optionally, update your UI to indicate the error to the user
      });
    toggleFilter();
  };
  const handleToggleConnectionRequests = () => {
    //setShowConnectionRequests(!showConnectionRequests); // Toggle the visibility
    setShowConnectionRequests((prev) => !prev);
  };

  const handleToggleRequestsFromOthers = () => {
    //setShowRequestsFromOthers(!showRequestsFromOthers);
    setShowRequestsFromOthers((prev) => !prev);
  };

  const fetchConnectionRequests = () => {
    if (!user.id) return;

    fetch(`/api/connection-requests/${user.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch connection requests");
        }
        return response.json();
      })
      .then((data) => {
        // Filter out pseudo admin users
        const nonAdminRequests = data.filter(
          (request) => !request.email.endsWith("@system.com")
        );

        showConnectRequests(nonAdminRequests.length);
        setConnectionRequests(nonAdminRequests.length);
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  };
  useEffect(() => {
    fetchConnectionRequests();
  }, [user.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(false);
    }, 2000); // Set the message to disappear after 2000 milliseconds (2 seconds)

    return () => clearTimeout(timer); // Clean up the timer
  }, []);
  useEffect(() => {
    if (refreshNeeded) {
      // Perform your refresh actions here
      fetchConnectedUsers(); // Example action: re-fetch connected users
      setShouldRefreshInteractions(true);
      // Optionally, reset other states or perform additional updates

      setRefreshNeeded(false); // Reset the refresh trigger
    }
  }, [refreshNeeded]); // This effect depends on `refreshNeeded`

  useEffect(() => {
    setShowConnectionRequests(false);
    setShowRequestsFromOthers(false);
  }, []);
  useEffect(() => {
    if (submitSuccess) {
      // Perform actions on success, e.g., show a success message, redirect, etc.
      //console.log("Request connections successful");
    }
  }, [submitSuccess]);
  useEffect(() => {
    if (loggedInUserId) {
      checkAuthorization(loggedInUserId).then((isAuthorized) => {
        if (!isAuthorized) {
          setAuthError(true); // Handle unauthorized access
          // Optionally, redirect the user
          // navigate("/login");
        }
      });
    }
  }, [loggedInUserId, navigate]);
  useEffect(() => {
    fetchConnectedUsers();
  }, [loggedInUserId, authError]);
  useEffect(() => {
    const socket = io(process.env.REACT_APP_BACKEND_HOST);
    socket.on("connections_change", (data) => {
      //console.log("connections_change", data);
      /**
       connections_change 
Object { id: 61, user_one_id: 84, user_two_id: 149, created_at: "2024-05-25T22:24:12.405383" }
​
       */
      /*On the requested id screen refresh their screen*/
      if (data.user_two_id === loggedInUserId) {
        //console.log("loggedInUserId-data.user_two_id", data.user_two_id);
        fetchConnectedUsers();
        //The connection requested by userId=84 has been accepted by userId=149
        
      }
      /*On the requester id machine send email to herself that her 
      connection request has been accepted*/
      if (data.user_one_id === loggedInUserId) {
        fetchConnectedUsers();
        //console.log("**users",users);
        fetchConnectionRequests();
        setShowConnectionRequests(false);
   
      }
    });
    socket.on("connection_requests_change", (data) => {
      //console.log("connection_requests_change", data);
      if(data.requested_id===loggedInUserId)

      fetchConnectionRequested()
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    if (loggedInUserId) {
      fetchConnectionRequested();
    }
  }, [loggedInUserId]);
  const fetchConnectionRequested = () => {
    fetch(`/api/connection-requested/${loggedInUserId}`)
      .then((response) => {
        if (!response.ok)
          throw new Error("Failed to fetch connection requests");
        return response.json();
      })
      .then((data) => {
        //console.log("fetchConnectionRequested", data);
        //setConnectionRequests(data);
        setRequestsFromOthers(data.length);
      })
      .catch((err) => {
        console.error("Error fetching connection requests:", err);
      });
  };
  const handleLogoutClick = () => {
    navigate("/"); // Update for v6
  };
  const handleCheckboxChange = (userId, username) => {
    // Update the selectedUserIds state
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
        if (lastSelectedUserId === userId) {
          setLastSelectedUserId(null);
        }
      } else {
        newSet.add(userId);
        setLastSelectedUserId(userId);
      }
      return newSet;
    });

    // Update the selectedUsernames state
    setSelectedUsernames((prev) => {
      const index = prev.indexOf(username);
      if (index !== -1) {
        // Username already exists, remove it
        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      } else {
        // Username does not exist, add it
        return [...prev, username];
      }
    });
  };

  const handleProfileClick = (selectedUserId, selectedUsername) => {
    navigate(`/userprofile/${selectedUserId}`, {
      state: {
        selectedUser: selectedUserId,
        loggedInUserId: loggedInUserId,
        selectedUsername: selectedUsername,
      },
    });
  };
  const uploadZipFile = (file, userId) => {
    const formData = new FormData();

    formData.append("zipFile", file);
    formData.append("userId", userId);

    fetch("/api/build-interaction-from-files", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Server responded with an error!");
        }
        return response.json();
      })
      .then((data) => {
        //console.log("Success:", data);
        setRefreshNeeded(true);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.log("No file selected.");
      return;
    }

    // Check if file.type includes 'zip'
    if (file.type.indexOf("zip") === -1) {
      console.log("File is not a ZIP archive.");
      // Clear the file input
      event.target.value = null;
      return;
    }

    // Use JSZip to read the ZIP file
    JSZip.loadAsync(file)
      .then((zip) => {
        // Validate the contents of the ZIP file
        let isValid = true;
        let jsonFileCount = 0;

        Object.keys(zip.files).forEach((filename) => {
          if (filename.endsWith(".json")) {
            jsonFileCount += 1;
          } else if (!filename.match(/\.(jpg|jpeg|png)$/i)) {
            // If the file is not JSON or an image, mark as invalid
            isValid = false;
          }
        });

        if (jsonFileCount !== 1) {
          isValid = false; // There must be exactly one JSON file
        }

        if (!isValid) {
          console.log("ZIP archive contents are invalid.");
          // Clear the file input for future uploads
          event.target.value = null;
          return;
        }

        // Proceed to process the ZIP file (e.g., extract and display contents)
        uploadZipFile(file, loggedInUserId);
        // After processing the file, clear the input to allow for new uploads
        event.target.value = null;
      })
      .catch((err) => {
        console.error("Error reading ZIP file:", err);
        // Clear the file input in case of an error as well
        event.target.value = null;
      });
  };

  const handleUpdateProfileClick = (loggedInUserId) => {
    navigate("/profile", { state: { userId: loggedInUserId } });
  };
  const handleNewInteraction = () => {
    navigate("/newsubmission", {
      state: {
        selectedUserIds: Array.from(selectedUserIds),
        userId: loggedInUserId,
      }, // Passing loggedInUserId to NewSubmission
    });
  };
  const informConnectionSuccess = async (selectedUserIds, selectedUserNames) => {
    // Ensure both arrays have the same length
    if (selectedUserIds.length !== selectedUserNames.length) {
      console.error("Selected user IDs and names arrays do not match in length.");
      return;
    }
   
    if (!notificationson) {
      return;
    }
  
    const associatedUsers = selectedUserIds.map((id, index) => ({
      id: id,
      username: selectedUserNames[index],
    }));
  
    try {
      for (let i = 0; i < associatedUsers.length; i++) {
        const response = await fetch("/api/notify_offline_users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "connection_accepted",
            title: "", // No title is needed for connection acceptance
            loggedInUserName: user.username,
            associatedUsers: [associatedUsers[i]], // Send one user at a time
          }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const result = await response.json();
        console.log("Notification sent successfully:", result);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };
  
  const enableSelectedConnections = async (selectedUserIds, selectedUserNames) => {
    setShowRequestsFromOthers(false);
  
    // Prepare the data to be sent in the request body
    const requestData = { selectedUserIds };
  
    try {
      const response = await fetch(`/api/enable-selected-connections/${loggedInUserId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
  
      if (!response.ok) {
        // If the server response is not OK, throw an error
        throw new Error("Network response was not ok");
      }
  
      const data = await response.json(); // Assuming the server responds with JSON
  
      // Handle the successful response here
      console.log("Connections successfully enabled:", data);
  
      try {
        await informConnectionSuccess(selectedUserIds, selectedUserNames);
      } catch (error) {
        console.error("Error in informConnectionSuccess:", error);
      }
  
      fetchConnectedUsers();
      // You may want to update your component's state based on the successful operation
      // For example, clear selectedUserIds or show a success message
    } catch (error) {
      console.error("Error enabling connections:", error);
      // Optionally, update your UI to indicate the error to the user
    }
  };
  
  const fetchConnectedUsers = () => {
    if (!authError && loggedInUserId) {
      fetch(`/api/connected/${loggedInUserId}`)
        .then((response) => response.json())
        .then((data) => {
          const loggedInUser = data.find((user) => user.id === loggedInUserId);
          const dbUserlist = data.filter((user) => user.id !== loggedInUserId);
          setUser(loggedInUser);
          setUsers(dbUserlist);

        })
        .catch((error) => console.error("Error fetching users:", error));
    }
  };
  const showConnectRequests = (count) => {
    setConnectionRequests(count);
  };
  const showRequestsOfOthers = (count) => {
    setRequestsFromOthers(count);
  };

  if (authError) {
    return (
      <div>
        Unauthorized access. Please <a href="/">log in</a>.
      </div>
    );
  }
  const svgStyle = {
    position: "absolute",
    left: "-40px",
    top: "50%",
    transform: "translateY(-50%)",
    animation: "float 2s ease-in-out infinite",
  };

  const buttonStyle = {
    animation: "pulse 2s infinite",
  };
  return (
    <div>
      {showMessage && (
        <div className="message-box">After login landing page</div>
      )}
      <div className="button-container">
        <Button
          variant="danger"
          onClick={handleLogoutClick}
          className="logout-button"
        >
          Logout {user ? user.username : ""}?
        </Button>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <Button
            variant={activeTab === "Interactions" ? "info" : "outline-info"}
            onClick={handleInteractionsTabClick}
          >
            Interactions
          </Button>
          <Button
            variant={
              activeTab === "Communication Centre" ? "info" : "outline-info"
            }
            onClick={handleCommunicationCentreTabClick}
          >
            Communication Centre
          </Button>
          <Button
            variant="outline-info"
            onClick={() => handleUpdateProfileClick(user.id)}
          >
            Profile
          </Button>
        </div>
        {activeTab === "Communication Centre" && (
          <div className="section-container">
            <div>
              <h2 className="font-style-4">Communication Centre</h2>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ScrollingHelpText message={helpMessage} width="400px" />
              </div>
            </div>
            <div className="users-list-container">
              <ul className="no-bullet">
                {users.map((user) => (
                  <li key={user.id} className="user-item">
                    <div className="user-info-container center-elements">
                      <span className="user-name">{user.username}</span>
                      <div className="center-elements">
                        <Button
                          variant="danger"
                          className="btn-sm"
                          onClick={() =>
                            deleteContactToBeDeleted(user.connection_id)
                          }
                          onMouseEnter={() =>
                            setHoveredContactToBeDeleted(user.connection_id)
                          }
                          onMouseLeave={() =>
                            setHoveredContactToBeDeleted(null)
                          }
                        >
                          {hoveredContactToBeDeleted === user.connection_id ? (
                            <TrashFill size={25} />
                          ) : (
                            <Trash size={25} />
                          )}
                        </Button>
                        <input
                          type="checkbox"
                          onChange={() =>
                            handleCheckboxChange(user.id, user.username)
                          }
                          checked={selectedUserIds.has(user.id)}
                          className="user-checkbox"
                        />
                        {lastSelectedUserId === user.id && (
                          <Button
                            variant="outline-info"
                            className="btn-sm btn-wrap"
                            onClick={handleNewInteraction}
                          >
                            Create New Submission with{" "}
                            {selectedUsernames.join(" ")}{" "}
                            {selectedUsernames.length === 1
                              ? "(Add other users by checking their box)"
                              : ""}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="thumb-profile-viewer">
                      <ThumbProfileViewer userId={user.id} />
                    </div>

                    <Button
                      variant="outline-info"
                      className="btn-sm"
                      onClick={() => handleProfileClick(user.id, user.username)}
                    >
                      View Profile
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="button_tower">
              <Button
                variant="outline-info"
                className="btn-sm"
                onClick={toggleFilter}
              >
                Replace Your Connection Requests
              </Button>
              {showFilter && (
                <FilterUsers
                  applyFilter={applyFilter}
                  closeWindow={toggleFilter}
                />
              )}
              <Button
                variant="outline-info"
                className="btn-sm"
                onClick={handleToggleConnectionRequests} // Use this handler to toggle the visibility
              >
                {showConnectionRequests
                  ? "Hide Your Connection Requests"
                  : `Show Your Connection Requests (${connectionRequests})`}
              </Button>
              {showConnectionRequests && (
                <ConnectionRequests
                  userId={loggedInUserId}
                  showConnectRequests={showConnectRequests}
                />
              )}
              <div style={{ position: "relative", display: "inline-block" }}>
                {!showRequestsFromOthers && requestsFromOthers > 0 && (
                  <svg width="30" height="30" style={svgStyle}>
                    <polygon points="0,0 30,15 0,30" fill="blue" />
                  </svg>
                )}
                <Button
                  variant="outline-info"
                  className="btn-sm"
                  onClick={handleToggleRequestsFromOthers}
                >
                  {showRequestsFromOthers
                    ? "Hide Connection Requests from Others"
                    : `Show Connection Requests from Others (${requestsFromOthers})`}
                </Button>

                {showRequestsFromOthers && (
                  <ConnectionRequested
                    userId={loggedInUserId}
                    onEnableSelectedConnections={enableSelectedConnections}
                    showRequestsOfOthers={showRequestsOfOthers}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {activeTab === "Interactions" && (
        <div className="section-container center-interaction-elements">
          <h2 className="font-style-4">Interactions</h2>
          <div>
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }} // Hide the file input, will be triggered by a button
              onChange={handleFileSelect}
              accept=".zip"
            />
            <Button
              variant="outline-info"
              onClick={() => document.getElementById("fileInput").click()}
            >
              Load Previously Saved Interaction
            </Button>
          </div>
          <InteractionTitles
            loggedInUserId={loggedInUserId}
            shouldRefreshInteractions={shouldRefreshInteractions}
            resetRefreshTrigger={() => setShouldRefreshInteractions(false)}
          />
        </div>
      )}
    </div>
  );
};

export default UsersList;
