// Pages/GamePage.tsx
import { useState, useEffect, useRef } from "react";
import { pb } from "../pb";
import { getPlayer } from "../session";
import "../../scss/GamePage.scss";

interface Player {
  id: string;
  name: string;
  is_host: boolean;
  active: boolean;
}

interface Category {
  id: string;
  category: string;
}

interface GameSession {
  id: string;
  clip_duration: number;
  song_count: number;
  no_repeat: boolean;
  categories: string[];
  status: string;
}

interface Message {
  id: string;
  player_name: string;
  text: string;
  created: string;
}

export default function GamePage() {
  const player = getPlayer();
  const isHost = player?.is_host ?? false;

  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [session, setSession] = useState<GameSession | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clipDuration, setClipDuration] = useState(15); // neu
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Spieler laden
  useEffect(() => {
    let cancelled = false;

    async function loadPlayers() {
      const cutoff = new Date(Date.now() - 2 * 60_000)
        .toISOString()
        .replace("T", " ");
      const result = await pb.collection("gtsuser").getList(1, 50, {
        filter: `active = true && last_seen > "${cutoff}"`,
        requestKey: null,
      });
      if (!cancelled) setPlayers(result.items as unknown as Player[]);
    }

    loadPlayers();
    pb.collection("gtsuser").subscribe("*", () => loadPlayers());

    return () => {
      cancelled = true;
      pb.collection("gtsuser").unsubscribe("*");
    };
  }, []);

  // Kategorien laden
  useEffect(() => {
    async function loadCategories() {
      const result = await pb.collection("SongCategories").getFullList();
      setCategories(result as unknown as Category[]);
    }
    loadCategories();
  }, []);

  // Session laden oder erstellen
  useEffect(() => {
    let cancelled = false;

    async function loadOrCreateSession() {
      const result = await pb.collection("game_session").getList(1, 1, {
        filter: `status = "waiting" || status = "playing"`,
        sort: "-created",
      });

      if (result.items.length > 0) {
        if (!cancelled) setSession(result.items[0] as unknown as GameSession);
      } else if (isHost) {
        const newSession = await pb.collection("game_session").create({
          clip_duration: 15,
          song_count: 10,
          no_repeat: true,
          categories: [],
          status: "waiting",
          host_id: player?.id,
          song_id: null,
        });
        if (!cancelled) setSession(newSession as unknown as GameSession);
      }
    }

    loadOrCreateSession();
    pb.collection("game_session").subscribe("*", (e) => {
      if (!cancelled) setSession(e.record as unknown as GameSession);
    });

    return () => {
      cancelled = true;
      pb.collection("game_session").unsubscribe("*");
    };
  }, [isHost, player?.id]);

  // Einstellung updaten (nur Host)
  async function updateSetting(field: Partial<GameSession>) {
    if (!session || !isHost) return;
    await pb.collection("game_session").update(session.id, field, {
      requestKey: null,
    });
  }

  function toggleCategory(id: string) {
    if (!session) return;
    const current = session.categories ?? [];
    const updated = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    updateSetting({ categories: updated });
  }

  function startGame() {
    updateSetting({ status: "playing" });
  }

  // Messages laden und subscriben
  useEffect(() => {
    if (!session?.id) return;
    let cancelled = false;

    async function loadMessages() {
      console.log("Loading messages for session:", session?.id);
      const result = await pb.collection("messages").getList(1, 100, {
        filter: `session_id = "${session!.id}"`,
        sort: "created",
        requestKey: null,
      });
      if (!cancelled) setMessages(result.items as unknown as Message[]);
    }

    loadMessages();

    pb.collection("messages").subscribe("*", (e) => {
      if (e.record.session_id !== session!.id) return;
      if (e.action === "create") {
        setMessages((prev) => [...prev, e.record as unknown as Message]);
      }
    });

    return () => {
      cancelled = true;
      pb.collection("messages").unsubscribe("*");
    };
  }, [session?.id, session]);

  // sendMessage ersetzen
  async function sendMessage() {
    if (!chatInput.trim() || !player || !session) return;
    const text = chatInput.trim();
    setChatInput("");
    await pb.collection("messages").create(
      {
        session_id: session.id,
        user_id: player.id,
        player_name: player.name,
        text,
      },
      { requestKey: null },
    );
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const gameRunning = session?.status === "playing";

  return (
    <div className="game">
      <aside className="game__players">
        <p className="game__players-title">Spieler — {players.length}</p>
        {players.map((p) => (
          <div key={p.id} className="player-item">
            <div className="player-item__dot" />
            <span className="player-item__name">{p.name}</span>
            {p.is_host && <span className="player-item__host-badge">Host</span>}
          </div>
        ))}
      </aside>

      <main className="game__main">
        {!gameRunning ? (
          <div className="game__settings">
            <div className="game__settings-card">
              <h2 className="game__settings-title">Spieleinstellungen</h2>

              <div className="game__setting-row">
                <label className="game__setting-label">
                  Clip-Länge: {clipDuration} Sekunden
                </label>
                <input
                  className="game__setting-input"
                  type="range"
                  min={5}
                  max={30}
                  value={clipDuration}
                  disabled={!isHost}
                  onChange={(e) => setClipDuration(parseInt(e.target.value))}
                  onMouseUp={(e) =>
                    updateSetting({
                      clip_duration: parseInt(
                        (e.target as HTMLInputElement).value,
                      ),
                    })
                  }
                  onTouchEnd={(e) =>
                    updateSetting({
                      clip_duration: parseInt(
                        (e.target as HTMLInputElement).value,
                      ),
                    })
                  }
                />
                <div className="game__setting-range-labels">
                  <span>5s</span>
                  <span>30s</span>
                </div>
              </div>

              <div className="game__setting-row">
                <label className="game__setting-label">Anzahl Songs</label>
                <input
                  className="game__setting-input"
                  type="number"
                  min={1}
                  max={50}
                  value={session?.song_count ?? 10}
                  disabled={!isHost}
                  onChange={(e) =>
                    updateSetting({
                      song_count: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="game__setting-row">
                <label className="game__setting-label">Kategorien</label>
                <div className="game__categories">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`game__category-btn${session?.categories?.includes(cat.id) ? " game__category-btn--active" : ""}`}
                      onClick={() => toggleCategory(cat.id)}
                      disabled={!isHost}
                    >
                      {cat.category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="game__setting-row">
                <label className="game__setting-toggle">
                  <input
                    type="checkbox"
                    checked={session?.no_repeat ?? true}
                    disabled={!isHost}
                    onChange={(e) =>
                      updateSetting({
                        no_repeat: e.target.checked,
                      })
                    }
                  />
                  <span>
                    No Repeat – Songs nicht wiederholen bis Playlist durch
                  </span>
                </label>
              </div>

              {isHost ? (
                <button
                  className="game__start-button"
                  onClick={startGame}
                  disabled={players.length < 1}
                >
                  Spiel starten
                </button>
              ) : (
                <p className="game__waiting">Warten auf den Host...</p>
              )}
            </div>
          </div>
        ) : (
          <div className="game__chat">
            <div className="game__messages">
              {messages.map((m) => (
                <div key={m.id} className="game__message">
                  <span className="game__message-author">{m.player_name}</span>
                  <span className="game__message-text">{m.text}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="game__input-row">
              <input
                className="game__chat-input"
                type="text"
                placeholder="Deine Antwort..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                className="game__send-button"
                onClick={sendMessage}
                disabled={!chatInput.trim()}
              >
                Senden
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
