import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InteractionTitles from "../InteractionTitles/InteractionTitles";
import ThumbProfileViewer from "./ThumbProfileViewer";
import ConnectionRequests from "./ConnectionRequests";
import ConnectionRequested from "./ConnectionRequested";
import FilterUsers from "./FilterUsers";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Trash, TrashFill } from "react-bootstrap-icons";
import { checkAuthorization } from "../system/authService"; // Ensure the path is correct
const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
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
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInUserId = location.state ? location.state.userId : null;
  const toggleFilter = () => {
    setShowConnectionRequests(false);
    setShowFilter(!showFilter);
  };
  const deleteContactToBeDeleted = (id) => {
    console.log("Attempting to delete connection with ID:", id);
  
    fetch(`/api/delete-connection/${id}`, {
      method: 'DELETE', // Use the DELETE HTTP method
    })
    .then(response => {
      if (!response.ok) {
        // If the server response is not OK, throw an error
        throw new Error('Network response was not ok');
      }
      return response.json(); // Assuming the server responds with JSON
    })
    .then(data => {
      console.log("Connection successfully deleted:", data);
      fetchConnectedUsers(); // Refresh the list to reflect the deletion
    })
    .catch(error => {
      console.error("Error deleting connection:", error);
      // Optionally, update your UI to indicate the error to the user
    });
  };
  const applyFilter = (filterCriteria) => {
    console.log(
      "Applying filter with criteria:",
      filterCriteria,
      "for user:",
      user.id
    );
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
        console.log("Filtered data:", data);
        setShowConnectionRequests(true);
        // Assuming 'data' includes some information or users to display, update your state accordingly
        // For example, if 'data' contains a list of filtered users, you might want to set them in your 'users' state
        // setUsers(data.filteredUsers or however your response structure looks like);
      })
      .catch((error) => {
        setIsSubmitting(false);
        setSubmitSuccess(false);
        console.error("Error applying filter:", error);
        // Optionally, update your UI to indicate the error to the user
      });
  };
  const handleToggleConnectionRequests = () => {
    setShowConnectionRequests(!showConnectionRequests); // Toggle the visibility
  };
  const handleToggleRequestsFromOthers = () => {
    setShowRequestsFromOthers(!showRequestsFromOthers);
  };
  useEffect(() => {
    setShowConnectionRequests(false);
    setShowRequestsFromOthers(false);
  }, []);
  useEffect(() => {
    if (submitSuccess) {
      // Perform actions on success, e.g., show a success message, redirect, etc.
      console.log("Request connections successful");
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

  const handleLogoutClick = () => {
    navigate("/"); // Update for v6
  };
  const handleCheckboxChange = (userId) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
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
  const enableSelectedConnections = (selectedUserIds) => {
    console.log("Enabling connections for user IDs:", selectedUserIds);
    console.log("Enabling connections for user IDs for ", loggedInUserId);
    setShowRequestsFromOthers(false);

    // Prepare the data to be sent in the request body
    const requestData = { selectedUserIds };

    fetch(`/api/enable-selected-connections/${loggedInUserId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (!response.ok) {
          // If the server response is not OK, throw an error
          throw new Error("Network response was not ok");
        }
        return response.json(); // Assuming the server responds with JSON
      })
      .then((data) => {
        // Handle the successful response here
        console.log("Connections successfully enabled:", data);
        fetchConnectedUsers();
        // You may want to update your component's state based on the successful operation
        // For example, clear selectedUserIds or show a success message
      })
      .catch((error) => {
        console.error("Error enabling connections:", error);
        // Optionally, update your UI to indicate the error to the user
      });
  };
  const fetchConnectedUsers = () => {
    if (!authError && loggedInUserId) {
      fetch(`/api/connected/${loggedInUserId}`)
        .then((response) => response.json())
        .then((data) => {
          const loggedInUser = data.find((user) => user.id === loggedInUserId);
          const dbUserlist = data.filter((user) => user.id !== loggedInUserId);
          console.log("fetchConnectedUsers-data",data)
          setUser(loggedInUser);
          setUsers(dbUserlist);
        })
        .catch((error) => console.error("Error fetching users:", error));
    }
  };
  const showConnectRequests = (count) => {
    console.log("ConnectRequests*", count);
    setConnectionRequests(count);
  };
  const showRequestsOfOthers = (count) => {
    console.log("RequestsFromOthers*", count);
    setRequestsFromOthers(count);
  };

  if (authError) {
    return (
      <div>
        Unauthorized access. Please <a href="/">log in</a>.
      </div>
    );
  }
  return (
    <div>
      <div className="button-container">
        <Button
          variant="danger"
          onClick={handleLogoutClick}
          className="logout-button"
        >
          Logout {user ? user.username : ""}?
        </Button>
        <Button
          variant="outline-info"
          onClick={() => handleUpdateProfileClick(user.id)}
        >
          Profile
        </Button>

        {showFilter && (
          <Modal show={showFilter} onHide={toggleFilter} centered>
            <Modal.Header closeButton>
              <Modal.Title>Update Connections</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <FilterUsers applyFilter={applyFilter} />
            </Modal.Body>
          </Modal>
        )}
      </div>
      <div className="users-list-container">
        <ul className="no-bullet">
          {users.map((user) => (
            <li key={user.id} className="user-item">
              <div className="user-info-container">
              <span className="user-name">{user.username}</span>
              <span className="user-name">{user.connection_id}</span>
                <div className="system-small-button-wrapper">
                  <Button
                    variant="danger"
                    className="btn-sm"
                    onClick={() => deleteContactToBeDeleted(user.connection_id)}
                    onMouseEnter={() => setHoveredContactToBeDeleted(user.connection_id)}
                    onMouseLeave={() => setHoveredContactToBeDeleted(null)}
                  >
                    {hoveredContactToBeDeleted === user.connection_id ? (
                      <TrashFill size={25} />
                    ) : (
                      <Trash size={25} />
                    )}
                  </Button>
                  <input
                    type="checkbox"
                    onChange={() => handleCheckboxChange(user.id)}
                    checked={selectedUserIds.has(user.id)}
                    className="user-checkbox"
                  />
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
        {selectedUserIds.size > 0 && (
          <Button
            variant="outline-info"
            className="btn-sm new-interaction-btn"
            onClick={handleNewInteraction}
          >
            {selectedUserIds.size === 1
              ? `Create new Submission with ${
                  users.find((user) => selectedUserIds.has(user.id)).username
                }`
              : "Create new Submission with group members"}
          </Button>
        )}
      </div>
      <Button
          variant="outline-info"
          className="btn-sm"
          onClick={toggleFilter}
        >
          Update Your Connection Requests
        </Button>
      <div className="button_tower">
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
      <h2>Interactions</h2>
      <InteractionTitles loggedInUserId={loggedInUserId} />
    </div>
  );
};

export default UsersList;
