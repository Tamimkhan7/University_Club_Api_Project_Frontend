import { useNavigate } from "react-router-dom";

export default function PostCard({ post }) {
  const nav = useNavigate();

  return (
    <div className="bg-white p-4 shadow rounded">
      <h3 className="font-bold">{post.userName}</h3>
      <p className="my-2">{post.content}</p>

      <div className="text-sm text-gray-500">
        ❤️ {post.reactionCount} | 💬 {post.commentCount}
      </div>

      <button
        onClick={() => nav(`/post/${post.id}`)}
        className="mt-2 text-blue-500"
      >
        View
      </button>
    </div>
  );
}