import { AIOverlayPanelProps } from './AIOverlayPanel';

export interface TranscriptState {
  isLoading: boolean;
  transcript: FormattedTranscript | null;
}

export interface FormattedTranscript {
  hasChapters: boolean;
  chunks: TranscriptChunk[];
}

export interface TranscriptChunk {
  title?: string;
  timestamp: string;
  startTime: number;
  text: string;
}

export interface TranscriptDisplayProps {
  fetchTranscript: () => Promise<TranscriptState>;
  transcriptState: TranscriptState;
  AIOverlayPanel: React.LazyExoticComponent<React.FC<AIOverlayPanelProps>>;
  onCollapse: () => void;
}
