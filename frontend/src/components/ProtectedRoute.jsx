import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../api/hooks/useAuth.js";

export default function ProtectedRoute({ children }) {
  const { bootstrapping, isAuthenticated } = useAuth();
  const location = useLocation();

  if (bootstrapping) return <div className="page">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
