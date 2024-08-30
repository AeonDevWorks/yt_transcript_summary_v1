import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';
import FunctionButtons, { FunctionButtonsProps } from './FunctionButtons';
import { useTheme, ThemeProvider } from './ThemeProvider';

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

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ fetchTranscript }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [transcriptState, setTranscriptState] = useState<TranscriptState>({
    isLoading: false,
    transcript: null,
  });
  const [fontSize, setFontSize] = useState('medium');
  const [currentChunkId, setCurrentChunkId] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const video = document.querySelector('video');
    if (video) {
      const updateCurrentChunk = () => {
        const currentTime = video.currentTime;
        const currentChunk = transcriptState.transcript?.chunks.find(
          chunk => chunk.startTime <= currentTime && chunk.startTime + 10 > currentTime
        );
        if (currentChunk) {
          setCurrentChunkId(`chunk-adw-${currentChunk.startTime}`);
        }
      };

      video.addEventListener('timeupdate', updateCurrentChunk);
      return () => video.removeEventListener('timeupdate', updateCurrentChunk);
    }
  }, [transcriptState.transcript]);

  const seekToTime = (time: number) => {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = time;
      video.play();
    }
  };

  const handleCopy = () => {
    if (transcriptState.transcript) {
      const text = transcriptState.transcript.chunks.map(chunk => chunk.text).join('\n');
      navigator.clipboard.writeText(text).then(() => {
        alert('Transcript copied to clipboard!');
      });
    }
  };

  const handleGoToCurrentTime = () => {
    const video = document.querySelector('video');
    if (video && transcriptRef.current && transcriptState.transcript) {
      const currentTime = video.currentTime;
      const currentChunk = transcriptState.transcript.chunks.reduce((prev, curr) => {
        return (currentTime >= prev.startTime && currentTime < curr.startTime) ? prev : curr;
      });
      if (currentChunk) {
        const chunkElement = document.getElementById(`chunk-adw-${currentChunk.startTime}`);
        if (chunkElement) {
          chunkElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setCurrentChunkId(`chunk-adw-${currentChunk.startTime}`);
        }
      }
    }
  };

  const handleSummarize = () => {
    // This is a placeholder. In a real implementation, you'd call an AI service to summarize the transcript.
    alert('Summarize functionality not implemented yet.');
  };

  const handleFontSize = () => {
    const sizes = ['base', 'lg', 'xl'];
    const currentIndex = sizes.indexOf(fontSize);
    const nextSize = sizes[(currentIndex + 1) % sizes.length];
    setFontSize(nextSize);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'base': return 'text-base';
      case 'xl': return 'text-xl';
      default: return 'text-lg';
    }
  };

  const { theme, toggleTheme } = useTheme();

  // Add this useEffect to handle theme changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className={`transcript-container-adw w-full rounded-lg shadow-lg overflow-hidden flex flex-col border-4 ${
      theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'
    }`} style={{ maxHeight: '480px' }}>
      {isExpanded ? (
        <>
          <FunctionButtons
            onCopy={handleCopy}
            onGoToCurrentTime={handleGoToCurrentTime}
            onSummarize={handleSummarize}
            onFontSize={handleFontSize}
            onCollapse={toggleExpand}
            onToggleTheme={toggleTheme}
            theme={theme}
          />
          <div ref={transcriptRef} className={`transcript-text-adw p-4 overflow-y-auto flex-grow ${getFontSizeClass()} ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            {transcriptState.isLoading ? (
              <div className="flex justify-center items-center h-16 mt-2">
                <Spinner size={32} />
              </div>
            ) : transcriptState.transcript ? (
              transcriptState.transcript.chunks.map((chunk, index) => (
                <div 
                  key={index} 
                  className={`transcript-chunk-adw mb-4 p-2 rounded transition-colors duration-500 ${
                    currentChunkId === `chunk-adw-${chunk.startTime}` 
                      ? (theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200')
                      : ''
                  }`} 
                  id={`chunk-adw-${chunk.startTime}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={() => seekToTime(chunk.startTime)}
                      className={`timestamp-button-adw text-base cursor-pointer transition-colors duration-200 hover:shadow-md ${
                        theme === 'dark'
                          ? 'text-blue-400 hover:text-blue-300'
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      {chunk.timestamp}
                    </button>
                    {transcriptState.transcript?.hasChapters && chunk.title && (
                      <h3 className={`chapter-title-adw font-bold text-xl ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>{chunk.title}</h3>
                    )}
                  </div>
                  <p className={`chunk-text-adw ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                  }`}>{chunk.text}</p>
                </div>
              ))
            ) : (
              <p className={`mt-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>No transcript available for this video.</p>
            )}
          </div>
        </>
      ) : (
        <Button 
          onClick={toggleExpand}
          className={`expand-button-adw w-full flex justify-between items-center p-4 text-left transition-colors ${
            theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
          }`}
          style={{ height: '48px' }}
        >
          <div className="flex items-center">
            <ExtensionIcon />
            <span className="font-medium text-xl ml-2">Transcript</span>
          </div>
          <ChevronIcon isExpanded={isExpanded} />
        </Button>
      )}
    </div>
  );
};

const ExtensionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
  </svg>
);

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

const WrappedTranscriptDisplay: React.FC<TranscriptDisplayProps> = (props) => (
  <ThemeProvider>
    <TranscriptDisplay {...props} />
  </ThemeProvider>
);

export default WrappedTranscriptDisplay;