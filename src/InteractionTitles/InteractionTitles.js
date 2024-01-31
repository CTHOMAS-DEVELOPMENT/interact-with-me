import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
const InteractionTitles = ({ loggedInUserId }) => {
  console.log("InteractionTitles:loggedInUserId", loggedInUserId);
  const [interactions, setInteractions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("InteractionTitles:useEffect-loggedInUserId", loggedInUserId);
    fetch(`/api/my_interaction_titles?logged_in_id=${loggedInUserId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("InteractionTitles:useEffect-data", data);

        return setInteractions(data);
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
    <div>
      <ul className="no-bullet">
        {Array.isArray(interactions) &&
          interactions.map((interaction, index) => (
            <li key={index} onClick={() => handleRowClick(interaction)}>
              {interaction.title} - {interaction.formatted_created_at} by{" "}
              {interaction.username}
              {interaction.user_id === loggedInUserId && (
                <Button
                  variant="outline-info"
                  className="btn-sm"
                  onClick={(event) => handleEditClick(interaction, event)}
                >
                  Edit
                </Button>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default InteractionTitles;
