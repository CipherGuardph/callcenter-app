import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function SubscriptionGate() {
  const { currentUser, membershipLoading, membership } = useAuth();
  const location = useLocation();

  if (membershipLoading) return <div className="center-state">Checking your membership...</div>;
  if (currentUser && membership?.needsOrder && location.pathname !== "/order") {
    return <Navigate to="/order" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
