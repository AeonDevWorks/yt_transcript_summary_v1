import React from 'react';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTheme } from './ThemeProvider';

export interface AIOverlayPanelProps {
  theme: string;
  aiSummary: string | null;
  summaryError: string | null;
  handleCloseSummary: () => void;
  handleRetrySummary: () => void;
  getFontSizeClass: () => string;
  getBackgroundColor: () => string;
}

const AIOverlayPanel: React.FC<AIOverlayPanelProps> = ({
  aiSummary,
  summaryError,
  handleCloseSummary,
  handleRetrySummary,
  getFontSizeClass,
  getBackgroundColor,
}) => {
  const { theme } = useTheme();

  const buttonClass = `p-2 w-10 h-10 flex items-center justify-center transition-colors duration-300 rounded ${
    theme === 'dark'
      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:text-black'
  }`;  

  return (
    <div 
      className={`ai-summary-overlay absolute top-0 left-0 right-0 bottom-0 p-4 overflow-y-auto ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-zinc-100'
      }`}
      style={{ 
        zIndex: 10,
        backgroundColor: getBackgroundColor(),
        maxHeight: 'calc(480px - 56px)'
      }}
    >
      <div className="flex items-center mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleCloseSummary}
                variant="ghost"
                size="sm"
                className={buttonClass}
                title="Close summary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Back to transcript</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <h2 className={`text-2xl font-bold ml-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>AI Summary</h2>
      </div>
      
      {aiSummary ? (
        <div className={`${getFontSizeClass()} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {aiSummary.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
      ) : summaryError ? (
        <div className="flex flex-col items-center justify-center h-full">
          <p className={`${getFontSizeClass()} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
            {summaryError}
          </p>
          <button
            onClick={handleRetrySummary}
            className={`p-2 rounded-full ${
              theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-full">
          <Spinner size={32} />
          <p className={`mt-4 ${getFontSizeClass()} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Generating AI Summary...
          </p>
        </div>
      )}
    </div>
  );
};

export default AIOverlayPanel;