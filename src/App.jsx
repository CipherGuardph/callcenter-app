import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { currentUser, logout } = useAuth();
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
        {currentUser ? (
          <nav className="nav-links" aria-label="Main navigation">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/practice">Practice</NavLink>
            <NavLink to="/history">History</NavLink>
            <button className="link-button" onClick={handleLogout} type="button">
              Log out
            </button>
          </nav>
        ) : null}
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
