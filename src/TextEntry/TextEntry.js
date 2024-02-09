import React, { useState } from "react";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
const TextEntry = ({ userId, submissionId, onPostSubmit }) => {
  const [textContent, setTextContent] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!textContent.trim()) {
      alert("Please enter some text.");
      return;
    }

    try {
      console.log("text-entry userId passed", userId);
      const response = await fetch(`/api/users/${submissionId}/text-entry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, textContent }), // Including userId in the request body
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
    }
  };

  return (
    <div className="text-entry">
      <form onSubmit={handleSubmit}>
        <textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="What's on your mind?"
        />
        <Button type="submit" variant="outline-info" className="btn-sm">
          Post
        </Button>{" "}
      </form>
    </div>
  );
};

export default TextEntry;
