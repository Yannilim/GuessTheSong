// Pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../session";
import "../../scss/LoginPage.scss";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit() {
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    try {
      await login(name.trim());
      onLogin();
      navigate("/session");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Etwas ist schiefgelaufen, versuch es nochmal.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <div className="login__box">
        <h2 className="login__title">Willkommen!</h2>
        <p className="login__subtitle">Wie sollen wir dich nennen?</p>
        <input
          className="login__input"
          type="text"
          placeholder="Dein Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoFocus
        />
        {error && <p className="login__error">{error}</p>}
        <button
          className="login__button"
          onClick={handleSubmit}
          disabled={loading || !name.trim()}
        >
          {loading ? "Einen Moment..." : "Los geht's"}
        </button>
      </div>
    </div>
  );
}
