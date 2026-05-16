import { LayoutDashboard, LogOut, PanelsTopLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../api/hooks/useAuth.js";
import { displayUserName } from "../utils/tasks.js";
import "./Navbar.css";

export default function Navbar() {
  const { logout, user } = useAuth();
  return (
    <header className="navbar">
      <NavLink className="navbar-brand" to="/dashboard">Team Tasks</NavLink>
      <nav className="navbar-links">
        <NavLink to="/dashboard"><LayoutDashboard size={17} />Dashboard</NavLink>
        <NavLink to="/projects"><PanelsTopLeft size={17} />Projects</NavLink>
      </nav>
      <div className="navbar-user">
        <span>{displayUserName(user)}</span>
        <span className="role-badge">{user?.role || "member"}</span>
        <button className="icon-btn" onClick={logout} aria-label="Log out" title="Log out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
