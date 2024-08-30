import React, { useState } from 'react';

interface TranscriptChunk {
  title?: string;
  timestamp: string;
  startTime: number;
  text: string;
}

interface FormattedTranscript {
  hasChapters: boolean;
  chunks: TranscriptChunk[];
}

interface TranscriptDisplayProps {
  transcript: FormattedTranscript;
}

const ChevronIcon: React.FC<{ isExpanded: boolean }> = ({ isExpanded }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const seekToTime = (time: number) => {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = time;
      video.play();
    }
  };

  return (
    <div className="transcript-container w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <button 
        onClick={toggleExpand}
        className="w-full flex justify-between items-center p-4 text-left bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <span className="font-medium">Transcript</span>
        <ChevronIcon isExpanded={isExpanded} />
      </button>
      {isExpanded && (
        <div className="transcript-text p-4 max-h-[60vh] overflow-y-auto">
          {transcript.chunks.map((chunk, index) => (
            <div key={index} className="mb-4">
              {transcript.hasChapters && chunk.title && (
                <h3 className="font-bold text-lg mb-2">{chunk.title}</h3>
              )}
              <button
                onClick={() => seekToTime(chunk.startTime)}
                className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-1 cursor-pointer"
              >
                {chunk.timestamp}
              </button>
              <p>{chunk.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TranscriptDisplay;