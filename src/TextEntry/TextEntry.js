import React, { useState } from "react";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import AlertMessage from "../system/AlertMessage";

import { Rocket, RocketFill } from "react-bootstrap-icons";
const TextEntry = ({ userId, submissionId, adminChatId, onPostSubmit }) => {
  const [textContent, setTextContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [alertKey, setAlertKey] = useState(0);
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!textContent.trim()) {
      setMessage("Please enter some text");
      setType("error");
      setAlertKey(prevKey => prevKey + 1);
      return;
    }
    setIsSubmitting(true); // Set submitting state to true
    try {
      const response = await fetch(`/api/users/${submissionId}/text-entry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, textContent, adminChatId }), // Including userId in the request body
      });

      const data = await response.json();
      if (response.ok) {
        setTextContent("");
        if (onPostSubmit) {
          onPostSubmit(); // Trigger the callback to re-fetch posts
        }
      } else {
        throw new Error(data.message || "Error submitting text");
      }
    } catch (error) {
      console.error("Error submitting text:", error);
    } finally {
      setIsSubmitting(false); // Reset submitting state regardless of the outcome
    }
  };

  return (
    <div className="text-entry">
      <form onSubmit={handleSubmit}>
        <div className="text-input-and-button">
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="What's on your mind?"
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            variant="outline-info"
            className="btn-icon"
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}
          >
            {isImageHovered ? <RocketFill size={25} /> : <Rocket size={25} />}
          </Button>
          {message && <AlertMessage key={alertKey} message={message} type={type} />}

        </div>
      </form>
    </div>
  );
};

export default TextEntry;
