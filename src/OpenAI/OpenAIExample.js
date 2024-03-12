import React, { useState } from 'react';

const OpenAIExample = () => {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchOpenAIResponse = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Customize these values as needed
          model: "text-davinci-003",
          prompt: "Translate the following English text to French: 'Hello, how are you?'",
          temperature: 0.7,
          max_tokens: 60,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResponse(data.choices[0].text.trim());
    } catch (error) {
      console.error('Error fetching OpenAI response:', error);
      setResponse('Error fetching response. Please check the console for more information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchOpenAIResponse} disabled={isLoading}>
        {isLoading ? 'Translating...' : 'Translate Text'}
      </button>
      <p>Response: {response}</p>
    </div>
  );
};

export default OpenAIExample;
