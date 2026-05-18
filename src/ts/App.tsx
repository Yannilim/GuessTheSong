import { useEffect, useState } from 'react';
import YouTube, { type YouTubeEvent } from 'react-youtube';
import { fetchPlaylistTracks, type Track } from './youtubeService';
import '../scss/App.scss';

export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    // Eine garantiert aktive Playlist (z.B. "NCS Release" - NoCopyrightSounds)
    const playlistId = 'PL0bMThDkWam_2g-Yl3gA2S5v0C665wWf5';
    
    fetchPlaylistTracks(playlistId).then((data) => {
      if (data.length > 0) {
        // Wir mischen die Songs einmal durch (Shuffeln), damit es ein echtes Spiel wird
        setTracks(data.sort(() => Math.random() - 0.5));
      }
    });
  }, []);

  const currentTrack = tracks[currentIndex];

  // Sobald der YouTube-Player bereit ist, starten wir das Audio
  const onPlayerReady = (event: YouTubeEvent) => {
    event.target.playVideo();
    setIsPlaying(true);
  };

  const nextTrack = () => {
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(false);
    } else {
      alert('Wahnsinn! Du hast alle Songs durch!');
    }
  };

  // Optionen für den YouTube-Player (unsichtbar und ohne Steuerelemente)
  const playerOptions = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0, // Versteckt die YouTube-Steuerleiste
    },
  };

  return (
    <div id="root">
      <main className="game-container">
        <h1>Guess the Song!</h1>

        {currentTrack ? (
          <div className="quiz-section">
            {/* Das ist unser unsichtbarer Player */}
            <YouTube 
              videoId={currentTrack.id} 
              opts={playerOptions} 
              onReady={onPlayerReady} 
            />

            <div className="status-box">
              {isPlaying ? (
                <p className="playing-text">🎵 Song wird im Hintergrund abgespielt... Errate ihn!</p>
              ) : (
                <p className="loading-text">Lade nächsten Song...</p>
              )}
            </div>

            {/* Nur zum Testen blenden wir den echten Namen ein, damit wir sehen, ob es stimmt */}
            <div className="cheat-sheet">
              <p><strong>Cheat-Modus (Lösung):</strong> {currentTrack.title}</p>
            </div>

            <button className="btn-next" onClick={nextTrack}>
              Nächster Song ➡️
            </button>
          </div>
        ) : (
          <p>Lade Playlist oder überprüfe deinen API-Key...</p>
        )}
      </main>
    </div>
  );
}