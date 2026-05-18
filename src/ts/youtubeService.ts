const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Interface für die Struktur eines Songs/Videos, das wir zurückgeben wollen
export interface Track {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
}

export const fetchPlaylistTracks = async (playlistId: string): Promise<Track[]> => {
  try {
    // Wir fordern die "snippet"-Details der Playlist-Einträge an (max. 50 Stück für den Anfang)
    const response = await fetch(
      `${BASE_URL}/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Fehler beim Laden der YouTube-Playlist');
    }

    const data = await response.json();

    // Die rohen API-Daten in unser sauberes Track-Format umwandeln
    return data.items.map((item: any) => {
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