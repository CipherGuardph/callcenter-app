import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { ADMIN_EMAIL } from "./services/membership.js";

export default function App() {
  const { currentUser, logout, membership } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand" to="/dashboard" aria-label="BPO Interview Simulator home">
          <span className="brand-mark">BI</span>
          <span>
            <strong>BPO Interview</strong>
            <small>Practice simulator</small>
          </span>
        </NavLink>
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/practice">Practice</NavLink>
          <NavLink to="/order">Order</NavLink>
          {currentUser ? (
            <>
              <NavLink to="/history">History</NavLink>
              {currentUser.email === ADMIN_EMAIL || membership?.role === "admin" ? <NavLink to="/admin">Admin</NavLink> : null}
              <button className="link-button" onClick={handleLogout} type="button">
                Log out
              </button>
            </>
          ) : (
            <NavLink to="/login">Log in</NavLink>
          )}
        </nav>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
