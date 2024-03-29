import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InteractionTitles from "../InteractionTitles/InteractionTitles";
import ConnectionRequests from "./ConnectionRequests";
import FilterUsers from "./FilterUsers";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { checkAuthorization } from "../system/authService"; // Ensure the path is correct
const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [authError, setAuthError] = useState(false); // State for authorization error
  const [showFilter, setShowFilter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showConnectionRequests, setShowConnectionRequests] = useState(false); // State to toggle connection requests visibility
  const [showRequestsFromOthers, setShowRequestsFromOthers] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const loggedInUserId = location.state ? location.state.userId : null;
  const toggleFilter = () => {
    setShowFilter(!showFilter);
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
    if (!authError) {
      fetch(`/api/connected/${loggedInUserId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("data", data);
          // Assuming 'data' is an array of user objects which includes the logged-in user
          const loggedInUser = data.find((user) => user.id === loggedInUserId);
          const dbUserlist = data.filter((user) => user.id !== loggedInUserId);
          setUser(loggedInUser);
          console.log("dbUserlist", dbUserlist);
          setUsers(dbUserlist);
        })
        .catch((error) => console.error("Error fetching users:", error));
    }
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
        <Button
          variant="outline-info"
          className="btn-sm"
          onClick={toggleFilter}
        >
          Update Your Connection Requests
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
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange(user.id)}
                  checked={selectedUserIds.has(user.id)}
                  className="user-checkbox"
                />
              </div>
              <Button
                variant="outline-info"
                className="btn-sm view-profile-btn"
                onClick={() => handleProfileClick(user.id, user.username)}
              >
                View Profile
              </Button>
            </li>
          ))}
        </ul>
      </div>
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
      <Button
        variant="outline-info"
        className="btn-sm"
        onClick={handleToggleConnectionRequests} // Use this handler to toggle the visibility
      >
        {showConnectionRequests
          ? "Hide Your Connection Requests"
          : "Show Your Connection Requests"}
      </Button>
      {showConnectionRequests && <ConnectionRequests userId={loggedInUserId} />}
      <Button
        variant="outline-info"
        className="btn-sm"
        onClick={handleToggleRequestsFromOthers}
      >
        {showRequestsFromOthers
          ? "Hide Connection Requests from Others"
          : "Show Connection Requests from Others"}
      </Button>
      {showRequestsFromOthers && <div>Connection Requests from Others content goes here...</div>}



      <h2>Interactions</h2>
      <InteractionTitles loggedInUserId={loggedInUserId} />
    </div>
  );
};

export default UsersList;
