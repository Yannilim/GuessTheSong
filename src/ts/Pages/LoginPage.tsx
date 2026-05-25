// LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pb } from "../pb";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit() {
    if (!username.trim()) return;
    setLoading(true);
    setError("");

    try {
      const randomEmail = `${crypto.randomUUID()}@temp.local`;
      const randomPassword = crypto.randomUUID();

      await pb.collection("users").create({
        email: randomEmail,
        password: randomPassword,
        passwordConfirm: randomPassword,
        username,
      });

      await pb
        .collection("users")
        .authWithPassword(randomEmail, randomPassword);
      navigate("/lobby");
    } catch (e) {
      setError("Etwas ist schiefgelaufen, versuch es nochmal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "300px",
        }}
      >
        <h2>Wie heißt du?</h2>
        <input
          type="text"
          placeholder="Dein Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoFocus
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button onClick={handleSubmit} disabled={loading || !username.trim()}>
          {loading ? "Einen Moment..." : "Los geht's"}
        </button>
      </div>
    </div>
  );
}
