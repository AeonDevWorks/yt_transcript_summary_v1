import React from 'react';
import ReactDOM from 'react-dom';
import TranscriptDisplay from './components/TranscriptDisplay';
import { createRoot } from 'react-dom/client';

declare global {
  interface Window {
    trustedTypes?: {
      createPolicy: (name: string, rules: { createHTML: (html: string) => string }) => { createHTML: (html: string) => string };
    };
  }
}

function injectReactComponent() {
  const targetElement = document.querySelector('#secondary');
  if (targetElement) {
    const container = document.createElement('div');
    container.id = 'yt-transcriber-container';
    targetElement.prepend(container);

    // Use Trusted Types if supported
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
      const policy = window.trustedTypes.createPolicy('react-html', {
        createHTML: (html) => html
      });
      const root = createRoot(container);
      root.render(React.createElement(TranscriptDisplay));
      container.innerHTML = policy.createHTML(container.innerHTML);
    } else {
      const root = createRoot(container);
      root.render(React.createElement(TranscriptDisplay));
    }
  }
}

// Check if we're on a YouTube video page
function isYouTubeVideoPage() {
  return window.location.hostname === 'www.youtube.com' && window.location.pathname === '/watch';
}

// Update extension icon badge
function updateExtensionBadge(status: string) {
  chrome.runtime.sendMessage({ action: 'updateBadge', status });
}

// Fetch and parse captions
async function fetchAndParseCaptions(captionTrackUrl: string) {
  const response = await fetch(captionTrackUrl);
  const xmlText = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const textElements = xmlDoc.getElementsByTagName('text');

  return Array.from(textElements).map((element) => ({
    text: element.textContent || '',
    start: parseFloat(element.getAttribute('start') || '0'),
    duration: parseFloat(element.getAttribute('dur') || '0'),
  }));
}

// Main function to run when the page loads
async function main() {
  if (isYouTubeVideoPage()) {
    const videoId = new URLSearchParams(window.location.search).get('v');
    if (videoId) {
      chrome.runtime.sendMessage({ action: 'fetchVideoData', videoId }, async (response) => {
        if (response.success) {
          updateExtensionBadge(response.captionsAvailable ? 'CC' : '');
          
          if (response.captionsAvailable) {
            const parsedCaptions = await fetchAndParseCaptions(response.captionTrackUrl);
            const transcriptData = {
              captions: parsedCaptions,
              chapters: response.chapters
            };
            // Store transcript data or pass it to your React component
            console.log('Transcript data:', transcriptData);
            // You might want to update your React component state here
          }
        } else {
          console.error('Error fetching video data:', response.error);
        }
      });
    }
    injectReactComponent();
  }
}

// Run the main function when the page loads
window.addEventListener('load', main);

// Listen for page navigation events
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    main();
  }
}).observe(document, { subtree: true, childList: true });