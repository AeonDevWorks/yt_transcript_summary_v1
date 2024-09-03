import React from 'react';
import { Button } from './ui/button';
import { useTheme } from './ThemeProvider';

interface CollapsedTranscriptButtonProps {
  onExpand: () => void;
}

const CollapsedTranscriptButton: React.FC<CollapsedTranscriptButtonProps> = ({ onExpand }) => {
  const { theme } = useTheme();

  return (
    <Button
      onClick={onExpand}
      className={`w-full h-12 flex items-center justify-center transition-colors duration-300 text-base font-medium ${
        theme === 'dark'
          ? 'bg-gray-700 text-white hover:bg-gray-600'
          : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
      }`}
    >
      Show Transcript
    </Button>
  );
};

export default CollapsedTranscriptButton;
