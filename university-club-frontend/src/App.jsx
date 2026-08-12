import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Feed from "./pages/Feed";
import Clubs from "./pages/Clubs";
import ClubDetails from "./pages/ClubDetails";
import Profile from "./pages/Profile";
import PostDetails from "./pages/PostDetails";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Events from "./pages/Events";
import LiveEvent from "./pages/LiveEvent";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Groups from "./pages/Groups";
import Files from "./pages/Files";
import Connections from "./pages/Connections";
import MyApplications from "./pages/MyApplications";
import MyInvites from "./pages/MyInvites";
import InviteDetails from "./pages/InviteDetails";
import Recommendations from "./pages/Recommendations";
import Leaderboard from "./pages/Leaderboard";
import Search from "./pages/Search";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'glass-card rounded-2xl',
          duration: 4000,
          style: {
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          },
        }}
      />
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/clubs" element={<ProtectedRoute><Clubs /></ProtectedRoute>} />
        <Route path="/clubs/:id" element={<ProtectedRoute><ClubDetails /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/events/:eventId/live" element={<ProtectedRoute><LiveEvent /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
        <Route path="/files" element={<ProtectedRoute><Files /></ProtectedRoute>} />
        <Route path="/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
        <Route path="/invites" element={<ProtectedRoute><MyInvites /></ProtectedRoute>} />
        <Route path="/invites/:inviteId" element={<ProtectedRoute><InviteDetails /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/post/:id" element={<ProtectedRoute><PostDetails /></ProtectedRoute>} />
      </Routes>
      <Footer />
    </>
  );
}