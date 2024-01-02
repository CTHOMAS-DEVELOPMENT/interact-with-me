import React, { useState } from "react";

const TextEntry = ({ userId, onPostSubmit }) => {
  const [textContent, setTextContent] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!textContent.trim()) {
      alert("Please enter some text.");
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}/text-entry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ textContent }),
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
        <button type="submit">Post</button>
      </form>
    </div>
  );
};

export default TextEntry;
