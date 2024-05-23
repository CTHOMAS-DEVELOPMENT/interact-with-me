import React, { useState, useEffect } from "react";
import ThumbProfileViewer from "./ThumbProfileViewer";
import { Button } from "react-bootstrap";
import { Trash, TrashFill } from "react-bootstrap-icons";
import AlertMessage from "../system/AlertMessage";
import ScrollingHelpText from "../system/ScrollingHelpText";

import "bootstrap/dist/css/bootstrap.min.css";
import {
  version1Orientations,
  version1Gender,
  version1Hobbies,
  version1Keys,
} from "../RegistrationProfileCreation/scopedCollections";
import FloatsMyBoat from "../RegistrationProfileCreation/FloatsMyBoat.js";
import Gender from "../RegistrationProfileCreation/Gender.js";
import Orientation from "../RegistrationProfileCreation/Orientation.js";
import Hobbies from "../RegistrationProfileCreation/Hobbies.js";
const ConnectionRequested = ({
  userId,
  onEnableSelectedConnections,
  showRequestsOfOthers,
}) => {
  const [connectionRequested, setConnectionRequested] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [hoveredDeleteContactMeId, setHoveredDeleteContactMeId] =
    useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [alertKey, setAlertKey] = useState(0);
  const getIndexOfValue = (arrayOf, value) => {
    return arrayOf.indexOf(value);
  };
  const helpMessage =
    process.env.REACT_APP_CONNECTION_REQUEST_TO_YOU ||
    "No help message configured.";
  const handleCheckboxChange = (requesterId, isChecked) => {
    setSelectedUserIds((prevSelectedUserIds) => {
      const updatedSelectedUserIds = new Set(prevSelectedUserIds);
      if (isChecked) {
        updatedSelectedUserIds.add(requesterId);
      } else {
        updatedSelectedUserIds.delete(requesterId);
      }
      return updatedSelectedUserIds;
    });
  };
  const deleteAllRequests = () => {
    // Call the API to delete all connection requests to the user
    fetch(`/api/delete-requests-to-me/${userId}`, {
      method: "DELETE", // Using DELETE method as per the endpoint definition
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete all connection requests");
        }
        return response.json(); // Assuming the server responds with JSON
      })
      .then(() => {
        setMessage("All connection requests deleted successfully");
        setType("success");
        setAlertKey((prevKey) => prevKey + 1);
        // Refresh the connection requested list
        fetchConnectionRequested();
      })
      .catch((error) => {
        setMessage("Error deleting connection requests: " + error);
        setType("error");
        setAlertKey((prevKey) => prevKey + 1);
      });
  };

  const deleteContactMe = (id) => {
    // Call the API to delete the connection request by ID
    fetch(`/api/delete-from-connection-requests/${id}`, {
      method: "POST", // or 'DELETE', depending on how your API is set up
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete connection request");
        }
        return response.json(); // Assuming the server responds with JSON
      })
      .then(() => {
        setMessage("Connection request deleted successfully");
        setType("info");
        setAlertKey((prevKey) => prevKey + 1);
        // Refresh the connection requested list
        fetchConnectionRequested();
      })
      .catch((error) => {
        setMessage("Error deleting connection request:" + error);
        setType("error");
        setAlertKey((prevKey) => prevKey + 1);
        //setError(error.message);
      });
  };
  const fetchConnectionRequested = () => {
    setIsLoading(true);
    fetch(`/api/connection-requested/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch connection requests");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Connection requests fetched successfully:", data);
        showRequestsOfOthers(data.length);
        setConnectionRequested(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching connection requests:", err);
        setError(err.message);
        setIsLoading(false);
      });
  };
  const handleEnableSelectedConnectionsClick = () => {
    onEnableSelectedConnections(Array.from(selectedUserIds));
  };
  useEffect(() => {
    //console.log("initial fetchConnectionRequested")
    fetchConnectionRequested();
  }, [userId]);

  if (isLoading) return <div>Loading connection requests...</div>;
  if (error) return <div>Error loading connection requests: {error}</div>;

  return (
    <div>
      <div className="connection-requests-container">
        <h2 className="font-style-4">Connection Requests to You</h2>
        <ScrollingHelpText message={helpMessage} width="auto" />
        {connectionRequested.length > 0 && (
          <Button
            variant="danger"
            onClick={deleteAllRequests}
            className="logout-button"
          >
            Delete All Requests
          </Button>
        )}
        {connectionRequested.length > 0 ? (
          <ul className="connection-requests-list">
            {connectionRequested.map((request) => (
              <li key={request.request_id} className="connection-request-item">
                {" "}
                <div className="connection-request-text">
                  <div className="left-side-listed-profile-section">
                    <span className="font-style-4">{request.username}</span>

                      <div className="thumb-profile-viewer">
                        <ThumbProfileViewer userId={request.requester_id} />
                      </div>
                      <div className="system-small-button-wrapper">
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            handleCheckboxChange(
                              request.requester_id,
                              e.target.checked
                            )
                          }
                        />
                        <Button
                          variant="danger"
                          className="btn-sm"
                          onClick={() => deleteContactMe(request.request_id)}
                          onMouseEnter={() =>
                            setHoveredDeleteContactMeId(request.id)
                          }
                          onMouseLeave={() => setHoveredDeleteContactMeId(null)}
                        >
                          {hoveredDeleteContactMeId === request.id ? (
                            <TrashFill size={25} />
                          ) : (
                            <Trash size={25} />
                          )}
                        </Button>
                        {selectedUserIds.has(request.requester_id) && (
                        <Button
                          variant="outline-info"
                          className="btn-sm"
                          onClick={handleEnableSelectedConnectionsClick}
                        >
                          Enable Selected Connections
                        </Button>
                      )}
                      </div>

                    <div style={{ display: "flex",justifyContent:"center" }}>
                      <Gender
                        onSelectGender={() => {}}
                        selected={getIndexOfValue(version1Gender, request.sex)}
                        defaultSize={100}
                        noChexbox={true}
                      />
                      <Orientation
                        onSelectOrientation={() => {}}
                        selected={getIndexOfValue(
                          version1Orientations,
                          request.sexual_orientation
                        )}
                        defaultSize={100}
                        noChexbox={true}
                      />
                      <Hobbies
                        onSelectHobby={() => {}}
                        selected={getIndexOfValue(
                          version1Hobbies,
                          request.hobbies
                        )}
                        defaultSize={100}
                        noTitle={true}
                        noChexbox={true}
                      />
                      <FloatsMyBoat
                        onSelectCarousel={() => {}}
                        selectedCarousel={getIndexOfValue(
                          version1Keys,
                          request.floats_my_boat
                        )}
                        defaultSize={100}
                        noChexbox={true}
                      />
                    </div>
                    <textarea
                      readOnly
                      className="about-you-textarea"
                      value={
                        request.about_you
                          ? request.about_you
                          : request.username + " has not entered anything yet.."
                      }
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No connection requests found.</p>
        )}
        {selectedUserIds.size > 0 && (
          <Button
            variant="outline-info"
            className="btn-sm"
            onClick={handleEnableSelectedConnectionsClick}
          >
            Enable Selected Connections
          </Button>
        )}
      </div>
      {message && <AlertMessage key={alertKey} message={message} type={type} />}
    </div>
  );
};

export default ConnectionRequested;
