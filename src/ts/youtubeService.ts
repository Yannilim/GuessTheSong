// .trim() schneidet versehentliche Leerzeichen am Anfang/Ende radikal ab
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY?.trim();
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface Track {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
}

export const fetchPlaylistTracks = async (playlistId: string): Promise<Track[]> => {
  try {
    if (!API_KEY) {
      throw new Error('API-Key fehlt!');
    }

    const response = await fetch(
      `${BASE_URL}/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`
    );

    // Falls Google meckert, lesen wir die genaue JSON-Fehlermeldung aus
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Das zieht die echte Nachricht von Google heraus und gibt sie glasklar aus
      const apiErrorMessage = errorData?.error?.message || 'Unbekannter Fehler';
      const apiErrorReason = errorData?.error?.errors?.[0]?.reason || 'Kein Grund angegeben';
      
      console.error('🚨 GOOGLE API FEHLERMELDUG:', apiErrorMessage);
      console.error('🚨 GRUND:', apiErrorReason);
      
      throw new Error(`YouTube API antwortete mit Status ${response.status}: ${apiErrorMessage}`);
    }

    const data = await response.json();

    if (!data.items) {
      return [];
    }

    return data.items.map((item: { snippet: { resourceId: { videoId: string }; title: string; thumbnails?: { medium?: { url: string }; default?: { url: string } } } }) => {
      const videoId = item.snippet.resourceId.videoId;
      return {
        id: videoId,
        title: item.snippet.title,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
      };
    });
  } catch (error) {
    console.error('YouTube API Error:', error);
    return [];
  }
};