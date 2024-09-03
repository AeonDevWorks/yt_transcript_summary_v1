import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';
import FunctionButtons from './FunctionButtons';
import { useTheme } from './ThemeProvider';
import { summarizeTranscript } from '../lib/aiSummarizer';
import { TranscriptDisplayProps, TranscriptState } from './TranscriptDisplayTypes';

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ fetchTranscript, transcriptState, AIOverlayPanel, onCollapse }) => {
  const { theme, toggleTheme } = useTheme();
  const [currentChunkId, setCurrentChunkId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'lg' | 'xl' | '2xl'>('xl');
  const [showAISummary, setShowAISummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [cachedSummaries, setCachedSummaries] = useState<Record<string, string>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLDivElement>(null);

  const seekToTime = (time: number) => {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = time;
    }
  };

  const handleCopy = () => {
    if (transcriptState.transcript) {
      const fullText = transcriptState.transcript.chunks.map(chunk => chunk.text).join(' ');
      navigator.clipboard.writeText(fullText);
    }
  };

  const handleGoToCurrentTime = () => {
    const video = document.querySelector('video');
    if (video && transcriptState.transcript) {
      const currentTime = video.currentTime;
      const currentChunk = transcriptState.transcript.chunks.find(chunk => 
        chunk.startTime <= currentTime && chunk.startTime + 5 > currentTime
      );
      if (currentChunk) {
        const chunkElement = document.getElementById(`chunk-adw-${currentChunk.startTime}`);
        if (chunkElement) {
          chunkElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setCurrentChunkId(`chunk-adw-${currentChunk.startTime}`);
        }
      }
    }
  };

  const handleSummarize = async () => {
    setShowAISummary(true);
    setAiSummary(null);
    setSummaryError(null);

    if (transcriptState.transcript) {
      const videoId = new URLSearchParams(window.location.search).get('v');
      if (videoId && cachedSummaries[videoId]) {
        setAiSummary(cachedSummaries[videoId]);
      } else {
        try {
          const fullTranscript = transcriptState.transcript.chunks.map(chunk => chunk.text).join(' ');
          const summary = await summarizeTranscript(fullTranscript);
          setAiSummary(summary);
          if (videoId) {
            setCachedSummaries(prev => ({ ...prev, [videoId]: summary }));
          }
        } catch (error) {
          console.error('Failed to generate summary:', error);
          setSummaryError('Failed to generate summary. Please try again.');
        }
      }
    }
  };

  const handleRetrySummary = () => {
    handleSummarize();
  };

  const handleCloseSummary = () => {
    setShowAISummary(false);
  };

  const handleFontSize = () => {
    const sizes = ['lg', 'xl', '2xl'];
    const currentIndex = sizes.indexOf(fontSize);
    const nextSize = sizes[(currentIndex + 1) % sizes.length] as 'lg' | 'xl' | '2xl';
    setFontSize(nextSize);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'lg': return 'text-lg';
      case '2xl': return 'text-2xl';
      default: return 'text-xl';
    }
  };

  const getThemeClass = (darkClass: string, lightClass: string) => {
    return theme === 'dark' ? darkClass : lightClass;
  };

  const getBackgroundColor = () => {
    return theme === 'dark' ? '#3f3f3f' : '#f1f1f1';
  };

  const handleToggleTheme = useCallback(() => {
    console.log('TranscriptDisplay: Toggling theme. Current theme:', theme);
    toggleTheme();
  }, [theme, toggleTheme]);

  const handleCollapse = useCallback(() => {
    if (onCollapse) {
      onCollapse();
    }
  }, [onCollapse]);

  useEffect(() => {
    console.log('TranscriptDisplay: Current theme after theme change:', theme);
  }, [theme]);

  return (
    <div 
      ref={containerRef}
      className={`transcript-container-adw w-full rounded-lg shadow-lg overflow-hidden flex flex-col border-4 relative
        yt-transcriber-${theme === 'dark' ? 'dark' : 'light'}
        ${theme === 'dark' ? 'bg-[#0f0f0f] text-[#f1f1f1] border-gray-700' : 'bg-white text-[#0f0f0f] border-gray-200'}`}
      style={{ maxHeight: '480px' }}
    >
      <>
        <FunctionButtons
          onCopy={handleCopy}
          onGoToCurrentTime={handleGoToCurrentTime}
          onSummarize={handleSummarize}
          onFontSize={handleFontSize}
          onToggleTheme={handleToggleTheme}
          onCollapse={handleCollapse}
          theme={theme}
        />
        <div className="relative flex-grow overflow-hidden">
          <div 
            ref={textAreaRef} 
            className={`transcript-text-adw p-4 overflow-y-auto h-full ${getFontSizeClass()} ${
              getThemeClass('bg-[#0f0f0f]', 'bg-white')
            }`}
            style={{ 
              maxHeight: 'calc(480px - 56px)' // Subtracting the height of the function buttons
            }}
          >
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
                      ? getThemeClass('bg-gray-700', 'bg-gray-200')
                      : ''
                  }`} 
                  id={`chunk-adw-${chunk.startTime}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={() => seekToTime(chunk.startTime)}
                      className={`timestamp-button-adw text-base cursor-pointer transition-colors duration-300 px-2 py-1 rounded ${
                        getThemeClass(
                          'bg-gray-700 text-blue-300 hover:bg-gray-600 hover:text-blue-200',
                          'bg-gray-200 text-blue-600 hover:bg-gray-300 hover:text-blue-700'
                        )
                      }`}
                    >
                      {chunk.timestamp}
                    </button>
                    {transcriptState.transcript?.hasChapters && chunk.title && (
                      <h3 className={`chapter-title-adw font-bold text-xl transition-colors duration-300 ${
                        getThemeClass('text-gray-100', 'text-gray-900')
                      }`}>{chunk.title}</h3>
                    )}
                  </div>
                  <p className={`chunk-text-adw transition-colors duration-300 ${
                    getThemeClass('text-gray-300', 'text-gray-700')
                  }`}>{chunk.text}</p>
                </div>
              ))
            ) : (
              <p className={`mt-2 transition-colors duration-300 ${
                getThemeClass('text-gray-200', 'text-gray-800')
              }`}>No transcript available for this video.</p>
            )}
          </div>
        </div>
        {showAISummary && (
          <React.Suspense fallback={<div>Loading AI Summary...</div>}>
            <AIOverlayPanel
              aiSummary={aiSummary}
              summaryError={summaryError}
              handleCloseSummary={handleCloseSummary}
              handleRetrySummary={handleRetrySummary}
              getFontSizeClass={getFontSizeClass}
              getBackgroundColor={getBackgroundColor}
              theme={theme}
            />
          </React.Suspense>
        )}
      </>
    </div>
  );
};

export default TranscriptDisplay;