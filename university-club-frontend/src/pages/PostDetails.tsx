import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    api.get(`/post/${id}`).then((res) => setPost(res.data));
    api.get(`/comment/post/${id}`).then((res) => setComments(res.data));
  }, [id]);

  const send = async () => {
    await api.post("/comment/create", {
      postId: id,
      content: text,
    });

    location.reload();
  };

  return (
    <div className="bg-white p-4 shadow">
      <p className="mb-4">{post?.content}</p>

      <h3 className="font-bold">Comments</h3>

      {comments.map((c) => (
        <div key={c.id} className="border-b py-2">
          <b>{c.userName}</b>
          <p>{c.content}</p>
        </div>
      ))}

      <div className="flex gap-2 mt-3">
        <input
          className="border flex-1 p-2"
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={send} className="bg-blue-500 text-white px-3">
          Send
        </button>
      </div>
    </div>
  );
}
