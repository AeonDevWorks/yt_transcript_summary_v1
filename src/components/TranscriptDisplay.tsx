import React, { useState, useCallback, useEffect } from 'react';
import { Spinner } from './ui/spinner';

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

interface TranscriptState {
  isLoading: boolean;
  transcript: FormattedTranscript | null;
}

interface TranscriptDisplayProps {
  fetchTranscript: () => Promise<TranscriptState>;
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

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ fetchTranscript }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [transcriptState, setTranscriptState] = useState<TranscriptState>({
    isLoading: false,
    transcript: null,
  });

  const toggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded && !transcriptState.transcript && !transcriptState.isLoading) {
      setTranscriptState(prevState => ({ ...prevState, isLoading: true }));
      fetchTranscript().then(newState => {
        setTranscriptState(newState);
      });
    }
  }, [isExpanded, transcriptState, fetchTranscript]);

  const seekToTime = (time: number) => {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = time;
      video.play();
    }
  };

  return (
    <div className="transcript-container w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ maxHeight: '360px' }}>
      <button 
        onClick={toggleExpand}
        className="w-full flex justify-between items-center p-4 text-left bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <span className="font-medium">Transcript</span>
        <ChevronIcon isExpanded={isExpanded} />
      </button>
      {isExpanded && (
        <div className="transcript-text p-4 overflow-y-auto flex-grow">
          {transcriptState.isLoading ? (
            <div className="flex justify-center items-center h-16 mt-2">
              <Spinner size={32} className="text-gray-900 dark:text-white" />
            </div>
          ) : transcriptState.transcript ? (
            transcriptState.transcript.chunks.map((chunk, index) => (
              <div key={index} className="mb-4">
                {transcriptState.transcript?.hasChapters && chunk.title && (
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
            ))
          ) : (
            <p className="mt-2">No transcript available for this video.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TranscriptDisplay;