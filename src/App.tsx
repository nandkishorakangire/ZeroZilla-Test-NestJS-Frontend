import React, { useState } from "react";
import axios from "axios";

import "./App.css";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

const App: React.FC = () => {
  const [textBlob, setTextBlob] = useState<string>();
  const [sentenceCount, setSentenceCount] = useState<"" | number>(4);
  const [results, setResults] = useState<{ group: string; summary: string }[]>(
    []
  );
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 10,
    total: 0,
  });

  const showSwal = (title: string, text: string) => {
    withReactContent(Swal).fire({
      title: <i>{title}</i>,
      text: text,
      allowEscapeKey: true,
    });
  };

  const handleSummarize = async () => {
    try {
      if (!textBlob) return;
      setIsFetchingData(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URI}/api/v1/summarize`,
        {
          text: textBlob,
          sentencesPerGroup: +sentenceCount || 0,
        }
      );
      if (response.status === 201) {
        setResults(response.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data?.length || 0,
        }));
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error summarizing text:",
          error.response ? error.response.data : error.message
        );
      } else {
        console.error("Unexpected error:", error);
      }
      showSwal("Error", "An error occurred while summarizing the text.");
    } finally {
      setIsFetchingData(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Input Box */}
      <textarea
        className="w-full p-2 border border-gray-400 rounded mb-4"
        rows={10}
        placeholder="Paste your text here..."
        value={textBlob}
        onChange={(e) => setTextBlob(e.target.value)}
      />
      <div className="flex items-center flex-wrap gap-2 mb-4">
        <input
          type="number"
          className="p-2 border border-gray-400 rounded min-w-full md:min-w-[300px]"
          value={sentenceCount}
          onChange={(e) => {
            setSentenceCount(
              e.target.value !== "" ? Number(e.target.value) : e.target.value
            );
          }}
          placeholder="Number of sentences per group"
        />
        <button
          onClick={handleSummarize}
          className="bg-blue-500 text-white p-2 rounded flex flex-row items-center"
        >
          <span className="mx-4">
            {isFetchingData ? "Summarizing..." : "Summarize"}
          </span>
          {isFetchingData ? (
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <></>
          )}
        </button>
      </div>
      <div
        className="grid grid-cols-2 grid-rows-[auto_auto_1fr] border-2 items-stretch rounded overflow-clip"
        style={{ gridAutoRows: "minmax(100px, 1fr)" }}
      >
        {/* Header Row 1 */}
        <div className="col-span-1 bg-gray-800 text-white text-center py-4 font-bold">
          Original Text Groups
        </div>
        {/* Header Row 2 */}
        <div className="col-span-1 bg-gray-600 text-white text-center py-4 font-bold">
          Summaries
        </div>
        {/* Column 1: Original Text Groups */}
        {results
          .slice(pagination.offset, pagination.offset + pagination.limit)
          .map((res, idx) => (
            <>
              <div key={"Group" + idx} className="p-2 border-b border-gray-400">
                <strong>Group {pagination.offset + idx + 1}:</strong>
                <p
                  className="hyphens-manual break-words"
                  style={{ wordBreak: "break-word" }}
                >
                  {res.group}
                </p>
              </div>
              <div
                key={"Summary" + idx}
                className="p-2 border-b border-gray-400"
              >
                <strong>Summary {pagination.offset + idx + 1}:</strong>
                <p>
                  {typeof res.summary === "object"
                    ? JSON.stringify(res.summary, null, 2)
                    : res.summary}
                </p>
              </div>
            </>
          ))}
      </div>
      {/* Pagination */}
      {pagination.total && pagination.total > pagination.limit ? (
        <div className="flex flex-row justify-around p-4">
          <button
            className={`${
              pagination.offset ? "bg-blue-500" : "bg-gray-500"
            } w-20 text-white p-2 rounded flex flex-row justify-center items-center`}
            onClick={() => {
              setPagination((prev) => ({
                ...prev,
                offset: prev.offset ? prev.offset - prev.limit : prev.offset,
              }));
            }}
          >
            <span>Prev</span>
          </button>
          <button
            className={`${
              pagination.offset + pagination.limit < pagination.total
                ? "bg-blue-500"
                : "bg-gray-500"
            } w-20 text-white p-2 rounded flex flex-row justify-center items-center`}
            onClick={() => {
              setPagination((prev) => ({
                ...prev,
                offset:
                  prev.offset + prev.limit < prev.total
                    ? prev.offset + prev.limit
                    : prev.offset,
              }));
            }}
          >
            <span>Next</span>
          </button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default App;
