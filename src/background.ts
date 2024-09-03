console.log('Background script loading');

import { GoogleGenerativeAI } from "@google/generative-ai";
import './lib/transcriptFetcher';

chrome.runtime.onInstalled.addListener(() => {
  console.log("YouTube Transcriber installed");
});

chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked');
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    console.log('Sending toggleTranscript message to content script');
    chrome.tabs.sendMessage(tab.id!, { action: "toggleTranscript" });
  }
});

const fetchWithTimeout = async (url: string, timeout = 10000): Promise<Response> => {
  console.log(`Fetching ${url} with timeout ${timeout}ms`);
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    console.log(`Fetch successful for ${url}`);
    return response;
  } catch (error) {
    clearTimeout(id);
    console.error(`Fetch failed for ${url}:`, error);
    throw error;
  }
};

const fetchWithRetry = async (url: string, retries = 3, timeout = 10000): Promise<Response> => {
  console.log(`Attempting to fetch ${url} with ${retries} retries`);
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchWithTimeout(url, timeout);
    } catch (error) {
      console.warn(`Retry ${i + 1} failed for ${url}:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error("Failed to fetch after retries");
};

const extractJSON = (text: string, startToken: string, endToken: string): any => {
  console.log('Extracting JSON from text');
  const startIndex = text.indexOf(startToken);
  if (startIndex === -1) {
    console.warn('Start token not found');
    return null;
  }

  let bracketCount = 0;
  let endIndex = startIndex + startToken.length;

  while (endIndex < text.length) {
    if (text[endIndex] === '{') bracketCount++;
    if (text[endIndex] === '}') bracketCount--;

    if (bracketCount === 0 && text.substring(endIndex).startsWith(endToken)) {
      break;
    }
    endIndex++;
  }

  if (bracketCount !== 0) {
    console.warn('Unbalanced brackets in JSON');
    return null;
  }

  const jsonString = text.substring(startIndex + startToken.length, endIndex);
  try {
    const parsedJSON = JSON.parse(jsonString);
    console.log('JSON extracted and parsed successfully');
    return parsedJSON;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
};

interface VideoData {
  captionsAvailable: boolean;
  captionTrackUrl?: string;
  chapters?: Array<{ title: string; timeRangeStartMillis: number }>;
  error?: string;
}

const fetchVideoData = async (videoId: string): Promise<VideoData> => {
  console.log(`Fetching video data for video ID: ${videoId}`);
  try {
    const response = await fetchWithRetry(`https://www.youtube.com/watch?v=${videoId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    console.log('YouTube page HTML fetched');
    
    const ytInitialData = extractJSON(html, 'var ytInitialData = ', ';</script>');
    if (!ytInitialData) {
      throw new Error("Failed to extract ytInitialData");
    }
    console.log('ytInitialData extracted');

    const captionTracksRegex = /"captionTracks":(\[.*?\])/;
    const captionTracksMatch = html.match(captionTracksRegex);
    if (!captionTracksMatch) {
      console.log('No caption tracks found');
      return { captionsAvailable: false };
    }
    
    const captionTracks = JSON.parse(captionTracksMatch[1]);
    console.log(`Found ${captionTracks.length} caption tracks`);
    let englishTrack = captionTracks.find(
      (track: any) => track.languageCode === "en" && track.kind !== "asr"
    ) || captionTracks.find(
      (track: any) => track.languageCode === "en" && track.kind === "asr"
    );
    
    if (!englishTrack) {
      console.log('No English caption track found');
      return { captionsAvailable: false };
    }
    console.log('English caption track found');

    const chapterMaps = ytInitialData.playerOverlays?.playerOverlayRenderer?.decoratedPlayerBarRenderer?.decoratedPlayerBarRenderer?.playerBar?.multiMarkersPlayerBarRenderer?.markersMap;
    let chapters = null;
    if (chapterMaps && chapterMaps.length > 0) {
      console.log('Chapter maps found, extracting chapters');
      const chapterMarkers = chapterMaps.find((marker: any) => marker.key === "DESCRIPTION_CHAPTERS");
      if (chapterMarkers && chapterMarkers.value?.chapters) {
        chapters = chapterMarkers.value.chapters.map((chapter: any) => ({
          title: chapter.chapterRenderer.title.simpleText,
          timeRangeStartMillis: chapter.chapterRenderer.timeRangeStartMillis
        }));
        console.log(`Extracted ${chapters.length} chapters`);
      }
    } else {
      console.log('No chapters found');
    }

    console.log('Video data fetched successfully');
    return {
      captionsAvailable: true,
      captionTrackUrl: englishTrack.baseUrl,
      chapters: chapters
    };
  } catch (error) {
    console.error("Error fetching video data:", error);
    return { captionsAvailable: false, error: (error as Error).message };
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background:', request);
  if (request.action === "fetchVideoData") {
    console.log('Fetching video data');
    fetchVideoData(request.videoId)
      .then(data => {
        console.log('Video data fetched, sending response');
        sendResponse({ success: true, ...data });
      })
      .catch(error => {
        console.error('Error in fetchVideoData:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Indicates that the response is sent asynchronously
  } else if (request.action === "updateBadge") {
    console.log('Updating badge:', request.status);
    chrome.action.setBadgeText({ text: request.status, tabId: sender.tab?.id });
    chrome.action.setBadgeBackgroundColor({ color: '#4285F4', tabId: sender.tab?.id });
  }
});

console.log('Background script setup complete');