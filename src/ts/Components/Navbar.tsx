// components/Navbar.tsx
import { useNavigate } from "react-router-dom";
import NavItem from "./NavItem";
import { pb } from "../pb";

const navItems = [
  { to: "/session", label: "Session", alwaysEnabled: true },
  { to: "/songs", label: "Songs", alwaysEnabled: false },
  { to: "/upload", label: "Upload", alwaysEnabled: false },
  { to: "/settings", label: "Settings", alwaysEnabled: true },
];

export default function Navbar() {
  const navigate = useNavigate();
  const gameRunning = false; // später ersetzen

  function logout() {
    pb.authStore.clear();
    navigate("/");
  }

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        height: "56px",
        borderBottom: "1px solid #e0e0e0",
        gap: "32px",
      }}
    >
      <span style={{ fontWeight: 700, fontSize: "18px", marginRight: "auto" }}>
        🎵 GTS
      </span>

      {navItems.map((item) => (
        <NavItem
          key={item.to}
          to={item.to}
          label={item.label}
          disabled={!item.alwaysEnabled && gameRunning}
        />
      ))}

      <button
        onClick={logout}
        style={{
          marginLeft: "auto",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
        }}
      >
        Logout
      </button>
    </nav>
  );
}
