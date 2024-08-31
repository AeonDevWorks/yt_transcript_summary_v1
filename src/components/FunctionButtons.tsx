import React from 'react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


export interface FunctionButtonsProps {
  onCopy: () => void;
  onGoToCurrentTime: () => void;
  onSummarize: () => void;
  onFontSize: () => void;
  onCollapse: () => void;
  onToggleTheme: () => void;
  theme: string;
}

const FunctionButtons: React.FC<FunctionButtonsProps> = ({
  onCopy,
  onGoToCurrentTime,
  onSummarize,
  onFontSize,
  onCollapse,
  onToggleTheme,
  theme,
}) => {
  const buttonClass = `p-2 w-14 h-14 flex items-center justify-center transition-colors duration-300 rounded ${
    theme === 'dark'
      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:text-black'
  }`;

  return (
    <div className={`flex justify-between items-center p-2 ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
    }`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onCopy} variant="ghost" size="sm" className={buttonClass}>
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy transcript</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onGoToCurrentTime} variant="ghost" size="sm" className={buttonClass}>
              <CurrentTimeIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go to current time</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onSummarize} variant="ghost" size="sm" className={buttonClass}>
              <AISparkleIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Summarize with AI</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onToggleTheme} variant="ghost" size="sm" className={buttonClass}>
              <ThemeIcon theme={theme} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle theme</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onFontSize} variant="ghost" size="sm" className={buttonClass}>
              <FontSizeIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Adjust font size</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onCollapse} variant="ghost" size="sm" className={buttonClass}>
              <ChevronUpIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Collapse transcript</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

// Updated SVG icons
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const CurrentTimeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const SummarizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" y1="10" x2="3" y2="10"></line>
    <line x1="21" y1="6" x2="3" y2="6"></line>
    <line x1="21" y1="14" x2="3" y2="14"></line>
    <line x1="21" y1="18" x2="3" y2="18"></line>
  </svg>
);

const ThemeIcon = ({ theme }: { theme: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
    <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" />
  </svg>
);

const FontSizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <text x="3" y="15" fontSize="9">A</text>
    <text x="12" y="20" fontSize="14">A</text>
  </svg>
);

const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

const AISparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Large sparkle */}
    <path d="M12 2C12 2 14 6 16 8C18 10 22 12 22 12C22 12 18 14 16 16C14 18 12 22 12 22C12 22 10 18 8 16C6 14 2 12 2 12C2 12 6 10 8 8C10 6 12 2 12 2Z" />
    {/* Small sparkle */}
    <path d="M19 2C19 2 20 3 21 4C22 5 23 6 23 6C23 6 22 7 21 8C20 9 19 10 19 10C19 10 18 9 17 8C16 7 15 6 15 6C15 6 16 5 17 4C18 3 19 2 19 2Z" />
  </svg>
);

export default FunctionButtons;