// components/Navbar.tsx
import { useNavigate } from "react-router-dom";
import { clearPlayer } from "../session";
import NavItem from "./NavItem";
import "../../scss/Navbar.scss";

const navItems = [
  { to: "/session", label: "Session", alwaysEnabled: true },
  { to: "/songs", label: "Songs", alwaysEnabled: false },
  { to: "/upload", label: "Upload", alwaysEnabled: false },
  { to: "/settings", label: "Settings", alwaysEnabled: true },
];

export default function Navbar() {
  const navigate = useNavigate();
  const gameRunning = false;

  // in Navbar.tsx

  function logout() {
    clearPlayer();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <span className="navbar__logo">🎵 GTS</span>
      <div className="navbar__links">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            label={item.label}
            disabled={!item.alwaysEnabled && gameRunning}
          />
        ))}
      </div>
      <button className="navbar__logout" onClick={logout}>
        Logout
      </button>
    </nav>
  );
}
