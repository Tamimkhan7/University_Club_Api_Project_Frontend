import { useEffect, useState } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get("/feed/feed").then((res) => setPosts(res.data));
  }, []);

  return (
    <div className="space-y-4">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}