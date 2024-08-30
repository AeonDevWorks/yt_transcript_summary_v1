import React from 'react';
import ReactDOM from 'react-dom';
import TranscriptDisplay from './components/TranscriptDisplay';
import { createRoot } from 'react-dom/client';

console.log('Content script loaded');

declare global {
  interface Window {
    trustedTypes?: {
      createPolicy: (name: string, rules: { createHTML: (html: string) => string }) => { createHTML: (html: string) => string };
    };
  }
}

function injectReactComponent() {
  console.log('Attempting to inject React component');
  const targetElement = document.querySelector('#secondary');
  if (targetElement) {
    console.log('Target element found, creating container');
    const container = document.createElement('div');
    container.id = 'yt-transcriber-container';
    targetElement.prepend(container);

    // Use Trusted Types if supported
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
      console.log('Using Trusted Types');
      const policy = window.trustedTypes.createPolicy('react-html', {
        createHTML: (html) => html
      });
      const root = createRoot(container);
      root.render(React.createElement(TranscriptDisplay));
      container.innerHTML = policy.createHTML(container.innerHTML);
    } else {
      console.log('Trusted Types not supported, rendering normally');
      const root = createRoot(container);
      root.render(React.createElement(TranscriptDisplay));
    }
    console.log('React component injected');
  } else {
    console.log('Target element not found');
  }
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
    text: element.textContent || '',
    start: parseFloat(element.getAttribute('start') || '0'),
    duration: parseFloat(element.getAttribute('dur') || '0'),
  }));
  console.log('Parsed captions:', parsedCaptions.length);
  return parsedCaptions;
}

// Main function to run when the page loads
async function main() {
  console.log('Main function called');
  if (isYouTubeVideoPage()) {
    const videoId = new URLSearchParams(window.location.search).get('v');
    console.log('Video ID:', videoId);
    if (videoId) {
      console.log('Sending fetchVideoData message to background');
      chrome.runtime.sendMessage({ action: 'fetchVideoData', videoId }, async (response) => {
        console.log('Received response from background:', response);
        if (chrome.runtime.lastError) {
          console.error('Error fetching video data:', chrome.runtime.lastError);
          return;
        }
        if (response.success) {
          console.log('Video data fetched successfully');
          updateExtensionBadge(response.captionsAvailable ? 'CC' : '');
          
          if (response.captionsAvailable) {
            console.log('Captions available, fetching and parsing');
            const parsedCaptions = await fetchAndParseCaptions(response.captionTrackUrl);
            const transcriptData = {
              captions: parsedCaptions,
              chapters: response.chapters
            };
            console.log('Transcript data:', transcriptData);
            // You might want to update your React component state here
          } else {
            console.log('Captions not available');
          }
        } else {
          console.error('Error fetching video data:', response.error);
        }
      });
    }
    console.log('Injecting React component');
    injectReactComponent();
  } else {
    console.log('Not a YouTube video page, skipping');
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