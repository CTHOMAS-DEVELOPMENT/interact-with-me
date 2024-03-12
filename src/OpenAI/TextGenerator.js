import React, { useState } from 'react';
async function fetchGeneratedText(prompt) {
    const response = await fetch('/api/generate-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
  
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  
    const data = await response.json();
    return data.generatedText;
  }
  
function TextGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');

  const handleGenerateText = async () => {
    try {
      const text = await fetchGeneratedText(prompt);
      setGeneratedText(text);
    } catch (error) {
      console.error("Error fetching generated text:", error);
    }
  };

  return (
    <div>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={handleGenerateText}>Generate</button>
      <p>Generated Text: {generatedText}</p>
    </div>
  );
}

export default TextGenerator;
