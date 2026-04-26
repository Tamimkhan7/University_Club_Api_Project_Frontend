import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import PostDetails from "./pages/PostDetails";
import Clubs from "./pages/Clubs";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post/:id" element={<PostDetails />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </>
  );
}