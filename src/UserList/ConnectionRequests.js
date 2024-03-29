import React, { useState, useEffect } from "react";
import ThumbProfileViewer from "./ThumbProfileViewer";
const ConnectionRequests = ({ userId }) => {
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
        console.log(
          "Filtered non-admin ConnectionRequests data",
          nonAdminRequests
        );

        setConnectionRequests(nonAdminRequests);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setError(err.message);
        setIsLoading(false);
      });
  }, [userId]);

  if (isLoading) return <div>Loading connection requests...</div>;
  if (error) return <div>Error loading connection requests: {error}</div>;

  return (
    <div className="connection-requests-container">
      <h2>Connection Requests</h2>
      {connectionRequests.length > 0 ? (
        <ul className="connection-requests-list">
          {connectionRequests.map((request) => (
            <li key={request.id} className="connection-request-item">
              <div className="connection-request-text">
                <div className="left-side-listed-profile-section">
                  <span>{request.username} ({request.sex})</span> 
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
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No connection requests found.</p>
      )}
    </div>
  );
};

export default ConnectionRequests;
