interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export async function fetchTranscript(): Promise<string> {
  try {
    // Get video ID from current URL
    const videoId = getYouTubeVideoId();
    if (!videoId) {
      throw new Error('Unable to find YouTube video ID');
    }

    // Fetch transcript data
    const response = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`);
    const xmlText = await response.text();

    // Parse XML to extract transcript segments
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const textElements = xmlDoc.getElementsByTagName('text');

    const transcriptSegments: TranscriptSegment[] = Array.from(textElements).map((element) => ({
      text: element.textContent || '',
      start: parseFloat(element.getAttribute('start') || '0'),
      duration: parseFloat(element.getAttribute('dur') || '0'),
    }));

    // Format transcript with timestamps
    const formattedTranscript = transcriptSegments
      .map((segment) => {
        const timestamp = formatTimestamp(segment.start);
        return `[${timestamp}] ${segment.text}`;
      })
      .join('\n');

    return formattedTranscript;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
}

function getYouTubeVideoId(): string | null {
  const url = new URL(window.location.href);
  return url.searchParams.get('v');
}

function formatTimestamp(seconds: number): string {
  const date = new Date(seconds * 1000);
  const minutes = date.getUTCMinutes();
  const secs = date.getUTCSeconds();
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}