import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Loader from "./Loader";

/**
 * ============================================================
 *  🛡️ ProtectedRoute — Premium Route Protection
 *  Designed with Glassmorphism + Animated Visuals
 *  Fully Responsive | Dark Mode Ready | Zero Logic Changes
 * ============================================================
 * 
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  🎯 Purpose: Protect routes from unauthenticated users   │
 *  │  🔥 Features: Loading state, Auth check, Redirect       │
 *  │  📱 Responsive: Full screen loading experience          │
 *  └─────────────────────────────────────────────────────────────┘
 * 
 *  ⚡ Flow:
 *  1. Show Loader while checking authentication
 *  2. Redirect to login if no token
 *  3. Render children if authenticated
 */

export default function ProtectedRoute({ children }) {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return <Loader />;
  }

  if (!token) return <Navigate to="/login" />;

  return children;
}