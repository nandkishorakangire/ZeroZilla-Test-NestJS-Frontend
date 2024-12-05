import React, { useState } from 'react';
import axios from 'axios';

import './App.css';

const App: React.FC = () => {
  const [textBlob, setTextBlob] = useState('');
  const [sentenceCount, setSentenceCount] = useState(4);
  const [results, setResults] = useState<{ group: string; summary: string }[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const handleSummarize = async () => {
    try {
      if (!textBlob) return;
      setIsFetchingData(true)
      const response = await axios.post('https://zerozilla-test-nestjs-backend.onrender.com/api/v1/summarize', {
        text: textBlob,
        sentencesPerGroup: sentenceCount,
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error summarizing text:', error);
      alert('An error occurred while summarizing the text.');
    } finally {
      setIsFetchingData(false)
    }
  };

  return (
    <div className="container mx-auto p-4">
      <textarea
        className="w-full p-2 border rounded mb-4"
        rows={10}
        placeholder="Paste your text here..."
        value={textBlob}
        onChange={(e) => setTextBlob(e.target.value)}
      />
      <div className="flex items-center gap-2 mb-4">
        <input
          type="number"
          className="p-2 border rounded"
          value={sentenceCount}
          onChange={(e) => setSentenceCount(Number(e.target.value))}
          placeholder="Number of sentences per group"
        />
        <button onClick={handleSummarize} className="bg-blue-500 text-white p-2 rounded flex flex-row items-center">
          <span className='mx-4'>{isFetchingData ? "Summarizing" : "Summarize"}</span>
          {isFetchingData && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>}
        </button>
      </div>
      <div className="flex">
        <div className="w-1/2 border-r p-2">
          <h3 className="font-bold">Original Text Groups</h3>
          {results.map((res, idx) => (
            <div key={idx} className="mb-2">
              <strong>Group {idx + 1}:</strong>
              <p>{res.group}</p>
            </div>
          ))}
        </div>
        <div className="w-1/2 p-2">
          <h3 className="font-bold">Summaries</h3>
          {results.map((res, idx) => (
            <div key={idx} className="mb-2">
              <strong>Summary {idx + 1}:</strong>
              <p>{typeof res.summary === 'object' ? JSON.stringify(res.summary) : res.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
