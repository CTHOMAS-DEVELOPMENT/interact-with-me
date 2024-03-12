import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import AlertMessage from "../system/AlertMessage";

import "bootstrap/dist/css/bootstrap.min.css";

const InteractionTitles = ({ loggedInUserId }) => {
  const [interactions, setInteractions] = useState([]);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [endedInteractions, setEndedInteractions] = useState([]); // Track ended interactions
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/my_interaction_titles?logged_in_id=${loggedInUserId}`)
      .then((response) => response.json())
      .then((data) => {
        setInteractions(data);
      })
      .catch((error) => {
        console.error("Error fetching interactions:", error);
        setMessage(`Error fetching interactions:${error}`);
        setType("error");
      });
  }, [loggedInUserId]);

  const handleTitleClick = (data) => {
    navigate("/feed", {
      state: {
        submissionId: data.submission_id,
        userId: loggedInUserId,
        title: data.title,
      },
    });
  };

  const handleEditClick = (interaction, event) => {
    event.stopPropagation(); // Prevent triggering handleTitleClick
    navigate("/editInteraction", {
      state: {
        submissionId: interaction.submission_id,
        loggedInUserId: loggedInUserId,
      },
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
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setType("info");
        setMessage(`The interaction has been removed`);
        setEndedInteractions((oldArray) => [
          ...oldArray,
          interaction.submission_id,
        ]);
      })
      .catch((error) => {
        console.error("Error ending interaction:", error);
        setMessage(`Error this interaction was not removed:${error}`);
        setType("error");
      });
  };

  return (
    <div className="wrapper-container">
      <ul className="no-bullet">
        {Array.isArray(interactions) &&
          interactions.map((interaction, index) => (
            <li key={index} className="interaction-item">
              {!endedInteractions.includes(interaction.submission_id) && (
                <div className="interaction-title-container">
                  <Button
                    variant="outline-info"
                    className="btn-sm"
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
                  Expected end: {endedInteractions.includes(interaction.submission_id) ? "Ended" : interaction.expected_end}
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
                      Edit
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
      {message && <AlertMessage message={message} type={type} />}
    </div>
  );
};

export default InteractionTitles;
