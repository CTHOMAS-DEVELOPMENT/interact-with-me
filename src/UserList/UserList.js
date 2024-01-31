import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InteractionTitles from "../InteractionTitles/InteractionTitles";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInUserId = location.state ? location.state.userId : null;

  useEffect(() => {
    fetch("/api/users")
      .then((response) => response.json())
      .then((data) =>
        setUsers(data.filter((user) => user.id !== loggedInUserId))
      )
      .catch((error) => console.error("Error fetching users:", error));
  }, [loggedInUserId]);
  const handleLogoutClick = () => {
    console.log("handleLogoutClick");
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

  const handleNewInteraction = () => {
    navigate("/newsubmission", {
      state: {
        selectedUserIds: Array.from(selectedUserIds),
        userId: loggedInUserId,
      }, // Passing loggedInUserId to NewSubmission
    });
  };

  return (
    <div>
      <Button variant="danger" onClick={handleLogoutClick}>
        Logout
      </Button>{" "}
      <h2>All Users</h2>
      <ul className="no-bullet">
        {users.map((user) => (
          <li key={user.id}>
            {user.username}
            <input
              type="checkbox"
              onChange={() => handleCheckboxChange(user.id)}
            />
            <Button
              variant="outline-info"
              className="btn-sm"
              onClick={() => handleProfileClick(user.id, user.username)}
            >
              View Profile
            </Button>{" "}
          </li>
        ))}
      </ul>
      {selectedUserIds.size > 0 && (
        <button onClick={handleNewInteraction}>
          {selectedUserIds.size === 1
            ? `Create new Submission with ${
                users.find((user) => selectedUserIds.has(user.id)).username
              }`
            : "Create new Submission with group members"}
        </button>
      )}
      {/* Include the InteractionTitles component */}
      <h2>My Interactions</h2>
      <InteractionTitles loggedInUserId={loggedInUserId} />
    </div>
  );
};

export default UsersList;
