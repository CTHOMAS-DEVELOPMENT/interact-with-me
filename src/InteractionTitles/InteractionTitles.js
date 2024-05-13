import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import AlertMessage from "../system/AlertMessage";

import "bootstrap/dist/css/bootstrap.min.css";

const InteractionTitles = ({
  loggedInUserId,
  shouldRefreshInteractions,
  resetRefreshTrigger,
}) => {
  const [interactions, setInteractions] = useState([]);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [endedInteractions, setEndedInteractions] = useState([]); // Track ended interactions
  const [alertKey, setAlertKey] = useState(0);
  const navigate = useNavigate();
  const svgStyle = {
    position: "absolute",
    left: "-60px",
    top: "50%",
    transform: "translateY(-50%)",
    animation: "float 2s ease-in-out infinite",
  };
  const buttonStyle = {
    animation: "pulse 2s infinite",
  };
  const fetchInteractions = () => {
    fetch(`/api/my_interaction_titles?logged_in_id=${loggedInUserId}`)
      .then((response) => response.json())
      .then((data) => {
        setInteractions(data);
      })
      .catch((error) => {
        console.error("Error fetching interactions:", error);
        setMessage(`Error fetching interactions:${error}`);
        setType("error");
        setAlertKey(prevKey => prevKey + 1);
      });
  };
  useEffect(() => {
    fetchInteractions();
  }, [loggedInUserId]);
  useEffect(() => {
    if (shouldRefreshInteractions) {
      resetRefreshTrigger();
    }
  }, [shouldRefreshInteractions, resetRefreshTrigger, loggedInUserId]);
  useEffect(() => {
    if (shouldRefreshInteractions) {
      fetchInteractions(); // Your function that fetches interactions
      resetRefreshTrigger(); // Reset the trigger passed down from parent
    }
  }, [shouldRefreshInteractions, resetRefreshTrigger]);
  const handleTitleClick = (data) => {
    navigate("/feed", {
      state: {
        submissionId: data.submission_id,
        userId: loggedInUserId,
        title: data.title,
      },
    });
  };
  // Function to upload the ZIP file

  const handleEditClick = (interaction, event) => {
    event.stopPropagation(); // Prevent triggering handleTitleClick
    navigate("/editInteraction", {
      state: {
        submissionId: interaction.submission_id,
        loggedInUserId: loggedInUserId,
      },
    });
  };
  const handleDownloadAndEndItClick = (interaction, event) => {
    event.preventDefault(); // Prevent default button behavior

    // API endpoint to call
    const apiUrl = `/api/closed-interaction-zip/${
      interaction.submission_id
    }?title=${encodeURIComponent(interaction.title)}`;

    // Fetch the ZIP file from the server
    fetch(apiUrl)
      .then((response) => {
        if (response.ok) return response.blob();
        throw new Error("Network response was not ok.");
      })
      .then((blob) => {
        // Create a new URL for the blob
        const url = window.URL.createObjectURL(blob);
        // Create a new <a> element to trigger the download
        const a = document.createElement("a");
        a.href = url;
        // Set the downloaded file name (you can customize it)
        a.download = `${interaction.title.replace(/\s+/g, "_")}.zip`;
        document.body.appendChild(a); // Append the <a> element to the document
        a.click(); // Trigger the download
        window.URL.revokeObjectURL(url); // Clean up the URL
        a.remove(); // Remove the <a> element

        // Optionally, end the interaction here or notify the user that the download is complete.
        // You may want to call another API to "end" the interaction, or update your application state accordingly.
      })
      .catch((error) => {
        console.error("Error downloading interaction ZIP:", error);
        // Handle any errors that occurred during the fetch operation
      });
  };

  const handleEndItClick = (interaction, event) => {
    event.stopPropagation(); // Prevent triggering handleTitleClick

    fetch("/api/end_interaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ submissionId: interaction.submission_id }),
    })
      .then((response) => {
        if (!response.ok) {
          setMessage(`Network response was not ok`);
          setType("error");
          setAlertKey(prevKey => prevKey + 1);
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setType("info");
        setMessage(`The interaction has been removed`);
        setAlertKey(prevKey => prevKey + 1);
        setEndedInteractions((oldArray) => [
          ...oldArray,
          interaction.submission_id,
        ]);
      })
      .catch((error) => {
        console.error("Error ending interaction:", error);
        setMessage(`Error this interaction was not removed:${error}`);
        setType("error");
        setAlertKey(prevKey => prevKey + 1);
      });
  };

  return (
    <div className="wrapper-container">
      <ul className="no-bullet">
        {Array.isArray(interactions) &&
          interactions.map((interaction, index) => (
            <li key={index} className="interaction-item">
              {!endedInteractions.includes(interaction.submission_id) && (
                <div
                  className="interaction-title-container"
                  key={index}
                  style={{
                    position: "relative",
                    display: "block",
                    textAlign: "left",
                  }}
                >
                  <svg width="50" height="50" style={svgStyle}>
                    <polygon points="0,0 50,25 0,50" fill="blue" />
                  </svg>
                  <Button
                    style={buttonStyle}
                    variant="outline-info"
                    className="btn-sm btn-pulse"
                    onClick={() => handleTitleClick(interaction)}
                  >
                    {interaction.title}
                  </Button>
                </div>
              )}
              <div className="interaction-details-container">
                <span
                  className="interaction-date"
                  title={interaction.formatted_created_at}
                >
                  Created: {interaction.formatted_created_at}
                </span>
                <span
                  className="interaction-expected-end"
                  title={interaction.expected_end}
                >
                  Expected end:{" "}
                  {endedInteractions.includes(interaction.submission_id)
                    ? "Ended"
                    : interaction.expected_end}
                </span>
              </div>
              <div className="interaction-edit-container">
                {interaction.user_id === loggedInUserId &&
                !endedInteractions.includes(interaction.submission_id) ? (
                  <>
                    <Button
                      variant="outline-info"
                      className="btn-sm interaction-edit"
                      onClick={(event) => handleEditClick(interaction, event)}
                    >
                      Invited
                    </Button>

                    <Button
                      variant="outline-info"
                      className="btn-sm interaction-edit"
                      onClick={(event) =>
                        handleDownloadAndEndItClick(interaction, event)
                      }
                    >
                      Download
                    </Button>

                    <Button
                      variant="danger"
                      className="btn-sm interaction-edit"
                      onClick={(event) => handleEndItClick(interaction, event)}
                    >
                      End it
                    </Button>
                  </>
                ) : (
                  <span className="interaction-username">
                    {interaction.username}
                  </span>
                )}
              </div>
            </li>
          ))}
      </ul>
      {message && <AlertMessage key={alertKey} message={message} type={type} />}
    </div>
  );
};

export default InteractionTitles;
