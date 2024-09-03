import './tailwind.css';  // This file will contain only Tailwind directives

import React from 'react';
import ReactDOM from 'react-dom';
import TranscriptDisplay, { TranscriptState, TranscriptDisplayProps } from './components/TranscriptDisplay';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './components/ThemeProvider';  // Add this import

console.log('Content script loaded');

declare global {
  interface Window {
    trustedTypes?: {
      createPolicy: (name: string, rules: { createHTML: (html: string) => string }) => { createHTML: (html: string) => string };
    };
    setTheme?: (theme: string) => void;
  }
}

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

function formatTranscript(parsedCaptions: any[], chapters: any[]): FormattedTranscript {
  if (chapters && chapters.length > 0) {
    console.log('Formatting transcript with chapters:', chapters);
    // Format with chapters
    const formattedChunks: TranscriptChunk[] = chapters.map((chapter, index) => {
      const nextChapterStart = chapters[index + 1] ? chapters[index + 1].timeRangeStartMillis : Infinity;
      const chapterCaptions = parsedCaptions.filter(
        caption => caption.start * 1000 >= chapter.timeRangeStartMillis && caption.start * 1000 < nextChapterStart
      );
      console.log(`Chapter ${index + 1}:`, { chapter, chapterCaptions });
      return {
        title: chapter.title,
        timestamp: formatTimestamp(chapter.timeRangeStartMillis / 1000),
        startTime: chapter.timeRangeStartMillis / 1000,
        text: chapterCaptions.map(caption => caption.text).join(' ')
      };
    });
    return { hasChapters: true, chunks: formattedChunks };
  } else {
    // Format into logical chunks with timestamps
    const chunkSize = 15; // Number of captions per chunk
    const formattedChunks: TranscriptChunk[] = [];
    for (let i = 0; i < parsedCaptions.length; i += chunkSize) {
      const chunk = parsedCaptions.slice(i, i + chunkSize);
      formattedChunks.push({
        timestamp: formatTimestamp(chunk[0].start),
        startTime: chunk[0].start,
        text: chunk.map(caption => caption.text).join(' ')
      });
    }
    return { hasChapters: false, chunks: formattedChunks };
  }
}

function formatTimestamp(seconds: number): string {
  if (!isFinite(seconds)) return '00:00';
  seconds = Math.max(0, Math.floor(seconds));
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const ss = seconds % 60;
  if (hh > 0) {
    return `${hh}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  }
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

function injectReactComponent(transcriptState: TranscriptState) {
  console.log('Attempting to inject React component');
  
  const inject = () => {
    const targetElement = document.querySelector('#secondary');
    if (targetElement) {
      console.log('Target element found');
      
      // Check if the container already exists
      let container = document.getElementById('yt-transcriber-container-adw');
      
      if (!container) {
        console.log('Creating new container');
        container = document.createElement('div');
        container.id = 'yt-transcriber-container-adw';
        container.style.width = '100%';
        container.style.marginBottom = '16px';
        
        targetElement.prepend(container);
      } else {
        console.log('Container already exists, updating content');
      }

      const root = createRoot(container);
      root.render(
        React.createElement(
          React.StrictMode,
          null,
          React.createElement(
            ThemeProvider,
            null,
            React.createElement(TranscriptDisplay, { fetchTranscript, transcriptState } as TranscriptDisplayProps)
          )
        )
      );
      console.log('React component injected or updated');

      container.dataset.reactRoot = 'true';
    } else {
      console.log('Target element not found');
    }
  };

  // Clean up existing React root if it exists
  const existingContainer = document.getElementById('yt-transcriber-container-adw');
  if (existingContainer && existingContainer.dataset.reactRoot) {
    const root = createRoot(existingContainer);
    root.unmount();
    console.log('Unmounted existing React root');
  }

  // Try to inject immediately
  inject();

  // If it fails, set up a MutationObserver to wait for the #secondary element
  if (!document.querySelector('#secondary')) {
    console.log('Setting up MutationObserver for #secondary');
    const observer = new MutationObserver((mutations, obs) => {
      const targetElement = document.querySelector('#secondary');
      if (targetElement) {
        console.log('#secondary found, injecting component');
        inject();
        obs.disconnect(); // Stop observing once injected
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

async function fetchTranscript(): Promise<TranscriptState> {
  const videoId = new URLSearchParams(window.location.search).get('v');
  if (!videoId) {
    return { isLoading: false, transcript: null };
  }

  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'fetchVideoData', videoId }, async (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error fetching video data:', chrome.runtime.lastError);
        resolve({ isLoading: false, transcript: null });
        return;
      }
      if (response.success && response.captionsAvailable) {
        const parsedCaptions = await fetchAndParseCaptions(response.captionTrackUrl);
        const formattedTranscript = formatTranscript(parsedCaptions, response.chapters);
        resolve({ isLoading: false, transcript: formattedTranscript });
      } else {
        resolve({ isLoading: false, transcript: null });
      }
    });
  });
}

// Check if we're on a YouTube video page
function isYouTubeVideoPage() {
  const isVideoPage = window.location.hostname === 'www.youtube.com' && window.location.pathname === '/watch';
  console.log('Is YouTube video page:', isVideoPage);
  return isVideoPage;
}

// Update extension icon badge
function updateExtensionBadge(status: string) {
  console.log('Updating extension badge:', status);
  chrome.runtime.sendMessage({ action: 'updateBadge', status });
}

// Fetch and parse captions
async function fetchAndParseCaptions(captionTrackUrl: string) {
  console.log('Fetching captions from:', captionTrackUrl);
  const response = await fetch(captionTrackUrl);
  const xmlText = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const textElements = xmlDoc.getElementsByTagName('text');

  const parsedCaptions = Array.from(textElements).map((element) => ({
    text: element.textContent?.replace(/&#39;/g, "'").replace(/&quot;/g, '"') || '',
    start: parseFloat(element.getAttribute('start') || '0'),
    duration: parseFloat(element.getAttribute('dur') || '0'),
  }));
  console.log('Parsed captions:', parsedCaptions.length);
  return parsedCaptions;
}

// Main function to run when the page loads
function main() {
  console.log('Main function called');
  
  // Reset extension state (including clearing saved theme)
  resetExtensionState();

  // Check if we're on a YouTube watch page
  if (location.pathname.startsWith('/watch')) {
    console.log('On YouTube watch page, fetching transcript');
    // Fetch transcript and inject React component
    fetchTranscript().then((transcriptState) => {
      injectReactComponent(transcriptState);
    }).catch((error) => {
      console.error('Error fetching transcript:', error);
      // Inject React component even if transcript fetch fails
      injectReactComponent({ isLoading: false, transcript: null });
    });
  } else {
    console.log('Not on YouTube watch page');
    // Clean up any existing React components
    cleanupReactComponent();
  }
}

function resetExtensionState() {
  console.log('Resetting extension state');
  // Clear saved theme
  localStorage.removeItem('yt-transcriber-theme');
  // Reset any other state variables or UI elements as needed
}

// Function to clean up React component
function cleanupReactComponent() {
  const container = document.getElementById('yt-transcriber-container-adw');
  if (container && container.dataset.reactRoot) {
    const root = createRoot(container);
    root.unmount();
    container.remove();
    console.log('Cleaned up React component');
  }
}

// Run the main function when the page loads
console.log('Adding load event listener');
window.addEventListener('load', main);

// Listen for page navigation events
console.log('Setting up MutationObserver');
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    console.log('URL changed, calling main function');
    lastUrl = url;
    main();
  }
}).observe(document, { subtree: true, childList: true });