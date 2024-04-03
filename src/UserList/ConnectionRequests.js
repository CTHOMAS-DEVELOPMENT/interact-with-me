import React, { useState, useEffect } from "react";
import ThumbProfileViewer from "./ThumbProfileViewer";
import AlertMessage from "../system/AlertMessage";

import { Button } from "react-bootstrap";
import { Trash, TrashFill } from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";
const ConnectionRequests = ({ userId, showConnectRequests }) => {
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredMyContactRequestId, setHoveredMyContactRequestId] =
    useState(null);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [error, setError] = useState("");
  const deleteAllRequests = () => {
    // Ensure we have a userId before making the API call
    if (!userId) return;

    // Call the new endpoint to delete all requests from the user
    fetch(`/api/delete-requests-from-me/${userId}`, {
      method: "DELETE", // Make sure to use the correct HTTP method
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          // If the server response is not OK, throw an error
          throw new Error("Network response was not ok");
        }
        return response.json(); // Assuming the server responds with JSON
      })
      .then((data) => {
        // Log the success message from the server
        setType("info");
        setMessage(data.message);
        // Refresh the list of connection requests
        fetchConnectionRequests();
      })
      .catch((error) => {
        setType("error");
        setMessage("Error deleting all requests:" + error);
      });
  };

  const deleteMyContactRequestId = (id) => {
    fetch(`/api/delete-from-connection-requests/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete connection request");
        }
        return response.json();
      })
      .then((data) => {
        setType("info");
        setMessage("Connection request successfully deleted:" + data);
        // Call fetchConnectionRequests to refresh the list
        fetchConnectionRequests();
      })
      .catch((err) => {
        setType("error");
        setMessage("Error:" + err);
        //setError(err.message);
      });
  };

  const fetchConnectionRequests = () => {
    if (!userId) return;

    setIsLoading(true);
    fetch(`/api/connection-requests/${userId}`)
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
        setConnectionRequests(nonAdminRequests);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setError(err.message);
        setIsLoading(false);
      });
  };
  useEffect(() => {
    fetchConnectionRequests();
  }, [userId]);

  if (isLoading) return <div>Loading connection requests...</div>;
  if (error) return <div>Error loading connection requests: {error}</div>;

  return (
    <div className="connection-requests-container">
      <h2>Connection Requests</h2>
      {connectionRequests.length > 0 && (
        <Button
          variant="danger"
          onClick={deleteAllRequests}
          className="logout-button"
        >
          Delete All My Requests
        </Button>
      )}
      {connectionRequests.length > 0 ? (
        <ul className="connection-requests-list">
          {connectionRequests.map((request) => (
            <li key={request.id} className="connection-request-item">
              <div className="connection-request-text">
                <div className="left-side-listed-profile-section">
                  <span>
                    {request.username} ({request.sex})
                  </span>
                  <span>{request.floats_my_boat} floats me!</span>
                </div>
                <div className="middle-listed-profile-section">
                  <p>
                    I prefer my sexual orientation to be referred to as{" "}
                    {request.sexual_orientation}. I have indicated that a hobby
                    of mine is {request.hobbies}.
                  </p>
                </div>
                <div className="thumb-profile-viewer">
                  <ThumbProfileViewer userId={request.requested_id} />
                </div>
                <Button
                  variant="danger"
                  className="btn-sm"
                  onClick={() => deleteMyContactRequestId(request.id)}
                  onMouseEnter={() => setHoveredMyContactRequestId(request.id)}
                  onMouseLeave={() => setHoveredMyContactRequestId(null)}
                >
                  {hoveredMyContactRequestId === request.id ? (
                    <TrashFill size={25} />
                  ) : (
                    <Trash size={25} />
                  )}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No connection requests found.</p>
      )}
      {message && <AlertMessage message={message} type={type} />}
    </div>
  );
};

export default ConnectionRequests;
