import React from 'react';
import { Button } from './ui/button';
import { useTheme } from './ThemeProvider';
import { Theme } from './ThemeProvider';

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
  const { toggleTheme } = useTheme();

  return (
    <div className="flex justify-between items-center p-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <Button onClick={onCopy} variant="ghost" size="sm" className="p-2 w-14 h-14 flex items-center justify-center" title="Copy transcript">
        <CopyIcon />
      </Button>
      <Button onClick={onGoToCurrentTime} variant="ghost" size="sm" className="p-2 w-14 h-14 flex items-center justify-center" title="Go to current time">
        <CurrentTimeIcon />
      </Button>
      <Button onClick={onSummarize} variant="ghost" size="sm" className="p-2 w-14 h-14 flex items-center justify-center" title="Summarize with AI">
        <SummarizeIcon />
      </Button>
      <Button onClick={toggleTheme} variant="ghost" size="sm" className="p-2 w-14 h-14 flex items-center justify-center" title="Toggle theme">
        <ThemeIcon theme={theme} />
      </Button>
      <Button onClick={onFontSize} variant="ghost" size="sm" className="p-2 w-14 h-14 flex items-center justify-center" title="Adjust font size">
        <FontSizeIcon />
      </Button>
      <Button onClick={onCollapse} variant="ghost" size="sm" className="p-2 w-14 h-14 flex items-center justify-center" title="Collapse transcript">
        <ChevronUpIcon />
      </Button>
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

export default FunctionButtons;