import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const InteractionTitles = ({ loggedInUserId }) => {
  const [interactions, setInteractions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/my_interaction_titles?logged_in_id=${loggedInUserId}`)
      .then((response) => response.json())
      .then((data) => {
        setInteractions(data);
      })
      .catch((error) => console.error("Error fetching interactions:", error));
  }, [loggedInUserId]);

  const handleRowClick = (data) => {
    navigate("/feed", {
      state: {
        submissionId: data.submission_id,
        userId: loggedInUserId,
        title: data.title,
      },
    });
  };

  const handleEditClick = (interaction, event) => {
    event.stopPropagation(); // Prevent triggering handleRowClick
    navigate("/editInteraction", {
      state: {
        submissionId: interaction.submission_id,
        loggedInUserId: loggedInUserId,
      },
    });
  };

  return (
    <div className="interaction-list-container">
      <ul className="no-bullet">
        {Array.isArray(interactions) &&
          interactions.map((interaction, index) => (
            <li key={index} className="interaction-item">
              <div className="interaction-title-container">
                <span className="interaction-title">{interaction.title}</span>
              </div>
              <div className="interaction-details-container">
                <span className="interaction-date" title={interaction.formatted_created_at}>
                  {interaction.formatted_created_at}
                </span>
                {interaction.user_id === loggedInUserId ? (
                  <Button
                    variant="outline-info"
                    className="btn-sm interaction-edit"
                    onClick={(event) => handleEditClick(interaction, event)}
                  >
                    Edit
                  </Button>
                ) : (
                  <span className="interaction-username">
                    {interaction.username}
                  </span>
                )}
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default InteractionTitles;
