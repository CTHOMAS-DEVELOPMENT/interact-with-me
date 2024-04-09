// TextUpdate.js
import React, { useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";

const TextUpdate = ({ dialogId, initialText, onSaveSuccess }) => {
  const [texty, setTexty] = useState("");
  const textAreaRef = useRef(null);
  useEffect(() => {
    // Focus the textarea and select the text after it has been auto-focused
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
    setTexty(initialText);
  }, [dialogId, initialText]);

  const handleSave = async () => {
    const response = await fetch(`/api/submission-dialog/${dialogId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text_content: texty }),
    });

    if (response.ok) {
      //const data = await response.json();
      // Call the onSaveSuccess callback to indicate that the save was successful
      onSaveSuccess();
    } else {
      console.error("Failed to update text content.");
    }
  };

  return (
    <div className="text-update">
      <textarea
        value={texty}
        onChange={(e) => setTexty(e.target.value)}
        className="form-control"
        onFocus={(e) => e.currentTarget.select()}
      />
      <Button variant="primary" onClick={handleSave}>
        Save
      </Button>
    </div>
  );
};

export default TextUpdate;
