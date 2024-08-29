chrome.runtime.onInstalled.addListener(() => {
  console.log("YouTube Transcriber installed");
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes("youtube.com/watch")) {
    chrome.tabs.sendMessage(tab.id, { action: "toggleTranscript" });
  }
});

const fetchWithTimeout = async (url, timeout = 10000) => {
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

const fetchWithRetry = async (url, retries = 3, timeout = 10000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchWithTimeout(url, timeout);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};

const extractJSON = (text, startToken, endToken) => {
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

const fetchVideoData = async (videoId) => {
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
      (track) => track.languageCode === "en" && track.kind !== "asr"
    ) || captionTracks.find(
      (track) => track.languageCode === "en" && track.kind === "asr"
    );
    
    if (!englishTrack) {
      return { captionsAvailable: false };
    }

    // Extract chapters
    const chapterMaps = ytInitialData.playerOverlays?.playerOverlayRenderer?.decoratedPlayerBarRenderer?.decoratedPlayerBarRenderer?.playerBar?.multiMarkersPlayerBarRenderer?.markersMap;
    let chapters = null;
    if (chapterMaps && chapterMaps.length > 0) {
      const chapterMarkers = chapterMaps.find(marker => marker.key === "DESCRIPTION_CHAPTERS");
      if (chapterMarkers && chapterMarkers.value?.chapters) {
        chapters = chapterMarkers.value.chapters.map(chapter => ({
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
    return { captionsAvailable: false, error: error.message };
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchVideoData") {
    fetchVideoData(request.videoId).then(sendResponse);
    return true; // Indicates that the response is sent asynchronously
  } else if (request.action === "updateBadge") {
    chrome.action.setBadgeText({ text: request.status, tabId: sender.tab.id });
    chrome.action.setBadgeBackgroundColor({ color: '#4285F4', tabId: sender.tab.id });
  }
});