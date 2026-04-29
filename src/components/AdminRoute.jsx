import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ADMIN_EMAIL } from "../services/membership.js";

export default function AdminRoute() {
  const { currentUser, membershipLoading, membership } = useAuth();
  const location = useLocation();

  if (membershipLoading) return <div className="center-state">Checking admin access...</div>;
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location }} />;
  if (currentUser.email !== ADMIN_EMAIL || membership?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
