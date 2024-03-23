import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AlertMessage from "../system/AlertMessage";
import { Button } from "react-bootstrap";
import { checkAuthorization } from '../system/authService'; // Adjust this import as necessary
import "bootstrap/dist/css/bootstrap.min.css";

const EditInteraction = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { submissionId, loggedInUserId } = location.state;
  const [authError, setAuthError] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [title, setTitle] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [initialSelectedUserIds, setInitialSelectedUserIds] = useState(
    new Set()
  );
  const [isChanged, setIsChanged] = useState(false); // State to track changes

  useEffect(() => {
    // Authentication check
    if (loggedInUserId) {
      checkAuthorization(loggedInUserId)
        .then((isAuthorized) => {
          if (!isAuthorized) {
            setAuthError(true);
            // Optionally, navigate to a login or unauthorized access page
            // navigate("/login");
          } else {
            // Proceed with fetching interaction details if authorized
            fetchInteractionDetails();
            fetchAllUsers();
          }
        });
    }
  }, [loggedInUserId, navigate]);
  const fetchInteractionDetails = () => {
    fetch(`/api/interaction_user_list?submission_id=${submissionId}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTitle(data[0].title); // Assuming title is in each object; adjust as needed
          const userIds = data.map((user) => user.id);
          setSelectedUserIds(new Set(userIds));
          setInitialSelectedUserIds(new Set(userIds)); // Save the initial state
        }
      })
      .catch((error) =>
        {
            console.error("Error fetching interaction details:", error)
            setMessage("Error fetching interaction details");
            setType("error");
        }
      );
  };

  const fetchAllUsers = () => {
    fetch("/api/users")
      .then((response) => response.json())
      .then((data) =>
        setUsers(data.filter((user) => user.id !== loggedInUserId))
      )
      .catch((error) => {
        console.error("Error fetching users:", error)
        setMessage("Error fetching users");
        setType("error");
    });
  };

  const handleCheckboxChange = (userId) => {
    setSelectedUserIds((prevSelectedUserIds) => {
      const updatedSelectedUserIds = new Set(prevSelectedUserIds);
      if (updatedSelectedUserIds.has(userId)) {
        updatedSelectedUserIds.delete(userId);
      } else {
        updatedSelectedUserIds.add(userId);
      }

      // Check if there are changes compared to the initial state
      setIsChanged(
        [...updatedSelectedUserIds].sort().join(",") !==
          [...initialSelectedUserIds].sort().join(",")
      );

      return updatedSelectedUserIds;
    });
  };
  const handleBackToMessagesClick = () => {
    navigate("/userlist", { state: { userId: loggedInUserId } }); // Update for v6
  };
  const handleUpdateGroupClick = () => {
    setMessage("");
    setType("info");
    const payload = {
      submissionId: submissionId,
      userIds: Array.from(selectedUserIds),
    };

    fetch("/api/update-the-group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          setMessage("Failed to update the group");
          setType("error");
          throw new Error("Failed to update the group");
        }
      })
      .then((data) => {
        setMessage("Group updated successfully");
        // Add any further processing or navigation here
      })
      .catch((error) => {
        setMessage("Group updated successfully");
        setType("error");
      });
  };
  if (authError) {
    return <div>Unauthorized. Please log in.</div>;
  }
  // Render the component
  return (
    <div>
      <Button
        variant="outline-info"
        className="btn-sm"
        onClick={handleBackToMessagesClick}
      >
        Back to messages
      </Button>{" "}
      <div className="centre-container">
        <div className="edit-interaction-container">
          <h2>{title}</h2>
          <ul className="no-bullet">
            {users.map((user) => (
              <li key={user.id} className="user-edit-item">
                <div className="user-edit-info">
                  <span className="username">{user.username}</span>
                  <input
                    type="checkbox"
                    checked={selectedUserIds.has(user.id)}
                    onChange={() => handleCheckboxChange(user.id)} // Pass user.id to the handler
                  />
                </div>
              </li>
            ))}
          </ul>
          {message && <AlertMessage message={message} type={type} />}
          {isChanged && (
            <Button
              variant="outline-info"
              className="btn-sm"
              onClick={handleUpdateGroupClick}
            >
              Update Group
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditInteraction;
