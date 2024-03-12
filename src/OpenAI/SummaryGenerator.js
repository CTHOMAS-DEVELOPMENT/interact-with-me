import React, { useState } from 'react';

async function fetchSummary(text) {
  const response = await fetch('/api/summarize-text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data.summary;
}

function SummaryGenerator() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');

  const handleSummarizeText = async () => {
    try {
      const summaryText = await fetchSummary(text);
      setSummary(summaryText);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text to summarize" />
      <button onClick={handleSummarizeText}>Summarize</button>
      <p>Summary: {summary}</p>
    </div>
  );
}

export default SummaryGenerator;