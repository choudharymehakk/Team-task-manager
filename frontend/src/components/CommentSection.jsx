import { motion } from "framer-motion";
import { Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "../api/hooks/useAuth.js";
import { useComments, useDeleteComment, usePostComment } from "../api/hooks/useComments.js";
import { relativeTime } from "../utils/relativeTime.js";

function initials(name = "User") {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CommentSection({ taskId }) {
  const [body, setBody] = useState("");
  const { user } = useAuth();
  const comments = useComments(taskId);
  const postComment = usePostComment(taskId);
  const deleteComment = useDeleteComment(taskId);

  async function submit(event) {
    event.preventDefault();
    if (!body.trim()) return;
    await postComment.mutateAsync(body);
    toast.success("Comment posted");
    setBody("");
  }

  async function remove(id) {
    await deleteComment.mutateAsync(id);
    toast.success("Comment deleted");
  }

  return (
    <section className="premium-card mt-6 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950">Discussion</h2>
          <p className="text-sm text-slate-500">Task comments and collaboration history.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{comments.data?.length || 0} comments</span>
      </div>
      <div className="grid gap-3">
        {comments.isLoading && Array.from({ length: 3 }).map((_, index) => <div className="skeleton h-24" key={index} />)}
        {comments.data?.map((comment) => (
          <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-[44px_1fr] gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4" key={comment.id}>
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-sm font-black text-white">
              {initials(comment.author_username)}
            </div>
            <div>
              <header className="flex items-center gap-2">
                <strong className="text-slate-900">{comment.author_username || "User"}</strong>
                <span className="text-xs text-slate-500">{relativeTime(comment.created_at)}</span>
                {comment.author_id === user?.id && (
                  <button className="ml-auto grid h-8 w-8 place-items-center rounded-xl text-rose-500 hover:bg-rose-50" aria-label="Delete comment" title="Delete comment" onClick={() => remove(comment.id)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </header>
              <p className="mt-2 leading-6 text-slate-600">{comment.body}</p>
            </div>
          </motion.article>
        ))}
        {!comments.isLoading && !comments.data?.length && <p className="rounded-2xl bg-slate-50 p-5 text-center text-slate-500">No comments yet. Start the thread.</p>}
      </div>
      <form onSubmit={submit} className="mt-5 grid gap-3">
        <textarea className="textarea-premium" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a comment..." />
        <button className="btn-primary justify-self-end" disabled={postComment.isPending}><Send size={17} />Post</button>
      </form>
    </section>
  );
}
