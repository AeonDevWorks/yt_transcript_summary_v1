import { GoogleGenerativeAI } from "@google/generative-ai";

chrome.runtime.onInstalled.addListener(() => {
  console.log("YouTube Transcriber installed");
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    chrome.tabs.sendMessage(tab.id!, { action: "toggleTranscript" });
  }
});

const fetchWithTimeout = async (url: string, timeout = 10000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const fetchWithRetry = async (url: string, retries = 3, timeout = 10000): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchWithTimeout(url, timeout);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error("Failed to fetch after retries");
};

const extractJSON = (text: string, startToken: string, endToken: string): any => {
  const startIndex = text.indexOf(startToken);
  if (startIndex === -1) return null;

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

  if (bracketCount !== 0) return null;

  const jsonString = text.substring(startIndex + startToken.length, endIndex);
  try {
    return JSON.parse(jsonString);
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
  try {
    const response = await fetchWithRetry(`https://www.youtube.com/watch?v=${videoId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    
    // Extract ytInitialData
    const ytInitialData = extractJSON(html, 'var ytInitialData = ', ';</script>');
    if (!ytInitialData) {
      throw new Error("Failed to extract ytInitialData");
    }

    // Extract caption tracks data
    const captionTracksRegex = /"captionTracks":(\[.*?\])/;
    const captionTracksMatch = html.match(captionTracksRegex);
    if (!captionTracksMatch) {
      return { captionsAvailable: false };
    }
    
    const captionTracks = JSON.parse(captionTracksMatch[1]);
    let englishTrack = captionTracks.find(
      (track: any) => track.languageCode === "en" && track.kind !== "asr"
    ) || captionTracks.find(
      (track: any) => track.languageCode === "en" && track.kind === "asr"
    );
    
    if (!englishTrack) {
      return { captionsAvailable: false };
    }

    // Extract chapters
    const chapterMaps = ytInitialData.playerOverlays?.playerOverlayRenderer?.decoratedPlayerBarRenderer?.decoratedPlayerBarRenderer?.playerBar?.multiMarkersPlayerBarRenderer?.markersMap;
    let chapters = null;
    if (chapterMaps && chapterMaps.length > 0) {
      const chapterMarkers = chapterMaps.find((marker: any) => marker.key === "DESCRIPTION_CHAPTERS");
      if (chapterMarkers && chapterMarkers.value?.chapters) {
        chapters = chapterMarkers.value.chapters.map((chapter: any) => ({
          title: chapter.chapterRenderer.title.simpleText,
          timeRangeStartMillis: chapter.chapterRenderer.timeRangeStartMillis
        }));
      }
    }

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
  if (request.action === "fetchVideoData") {
    fetchVideoData(request.videoId).then(sendResponse);
    return true; // Indicates that the response is sent asynchronously
  } else if (request.action === "updateBadge") {
    chrome.action.setBadgeText({ text: request.status, tabId: sender.tab?.id });
    chrome.action.setBadgeBackgroundColor({ color: '#4285F4', tabId: sender.tab?.id });
  }
});