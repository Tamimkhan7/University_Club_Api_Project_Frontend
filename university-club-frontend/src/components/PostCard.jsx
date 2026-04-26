import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="font-bold">{post.userName}</h3>

      <p className="my-3">{post.content}</p>

      <div className="text-gray-500 text-sm">
        ❤️ {post.reactionCount} | 💬 {post.commentCount}
      </div>

      <Link to={`/post/${post.id}`} className="text-blue-500 mt-3 inline-block">
        View Details
      </Link>
    </div>
  );
}
