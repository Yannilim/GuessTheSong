import { NavLink } from "react-router-dom";
interface NavItemProps {
  to: string;
  label: string;
  disabled?: boolean;
}

export default function NavItem({ to, label, disabled = false }: NavItemProps) {
  if (disabled) {
    return (
      <span style={{ color: "#aaa", cursor: "not-allowed" }}>{label}</span>
    );
  }
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        fontWeight: isActive ? 600 : 400,
        textDecoration: "none",
        color: "inherit",
      })}
    >
      {label}
    </NavLink>
  );
}
