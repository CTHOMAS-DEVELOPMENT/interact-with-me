import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const EditInteraction = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { submissionId, loggedInUserId } = location.state;

  const [title, setTitle] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [initialSelectedUserIds, setInitialSelectedUserIds] = useState(
    new Set()
  );
  const [isChanged, setIsChanged] = useState(false); // State to track changes

  useEffect(() => {
    // Fetch the interaction details
    // Fetch the interaction details
    fetch(`/api/interaction_user_list?submission_id=${submissionId}`)
      .then((response) => response.json())
      .then((data) => {
        // Assuming data is an array; add checks for safety
        if (Array.isArray(data) && data.length > 0) {
          setTitle(data[0].title); // Assuming title is in each object; adjust as needed
          const userIds = data.map((user) => user.id);
          setSelectedUserIds(new Set(userIds));
          setInitialSelectedUserIds(new Set(userIds)); // Save the initial state
        }
      })
      .catch((error) =>
        console.error("Error fetching interaction details:", error)
      );

    // Fetch all users
    fetch("/api/users")
      .then((response) => response.json())
      .then((data) =>
        setUsers(data.filter((user) => user.id !== loggedInUserId))
      )
      .catch((error) => console.error("Error fetching users:", error));
  }, [submissionId, loggedInUserId]);
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
    navigate('/userlist', { state: { userId: loggedInUserId } }); // Update for v6

  };
  const handleUpdateGroupClick = () => {
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
          throw new Error("Failed to update the group");
        }
      })
      .then((data) => {
        console.log("Group updated successfully:", data);
        // Add any further processing or navigation here
      })
      .catch((error) => {
        console.error("Error updating group:", error);
      });
  };

  // Render the component
  return (
    <div>
      <button onClick={handleBackToMessagesClick}>Back to messages</button>{" "}
      {/* Back to messages link */}
      <h2>Edit Interaction: {title}</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username}
            <input
              type="checkbox"
              checked={selectedUserIds.has(user.id)}
              onChange={() => handleCheckboxChange(user.id)} // Pass user.id to the handler
            />
          </li>
        ))}
      </ul>
      {isChanged && (
        <button onClick={handleUpdateGroupClick}>Update Group</button>
      )}
    </div>
  );
};

export default EditInteraction;
