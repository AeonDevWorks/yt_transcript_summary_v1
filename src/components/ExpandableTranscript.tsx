import React, { useState, useCallback, lazy, Suspense } from 'react';
import { TranscriptState } from './TranscriptDisplayTypes';
import { AIOverlayPanelProps } from './AIOverlayPanel';
import CollapsedTranscriptButton from './CollapsedTranscriptButton';

const TranscriptDisplay = lazy(() => import(/* webpackChunkName: "TranscriptDisplay" */ './TranscriptDisplay'));

interface ExpandableTranscriptProps {
  initialTranscriptState: TranscriptState;
  fetchTranscript: () => Promise<TranscriptState>;
  AIOverlayPanel: React.LazyExoticComponent<React.FC<AIOverlayPanelProps>>;
}

const ExpandableTranscript: React.FC<ExpandableTranscriptProps> = ({
  initialTranscriptState,
  fetchTranscript,
  AIOverlayPanel
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [transcriptState, setTranscriptState] = useState(initialTranscriptState);

  const handleExpand = useCallback(() => {
    setIsExpanded(true);
    if (!transcriptState.transcript && !transcriptState.isLoading) {
      setTranscriptState(prevState => ({ ...prevState, isLoading: true }));
      fetchTranscript().then(newState => {
        setTranscriptState(newState);
      });
    }
  }, [transcriptState, fetchTranscript]);

  if (!isExpanded) {
    return React.createElement(CollapsedTranscriptButton, { onExpand: handleExpand });
  }

  return React.createElement(
    Suspense,
    { fallback: React.createElement('div', null, 'Loading transcript...') },
    React.createElement(TranscriptDisplay, {
      fetchTranscript: fetchTranscript,
      transcriptState: transcriptState,
      AIOverlayPanel: AIOverlayPanel,
      onCollapse: () => setIsExpanded(false)
    })
  );
};

export default ExpandableTranscript;
