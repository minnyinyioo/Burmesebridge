import { Send } from "lucide-react";

type CommentProfile = {
  display_name?: string | null;
  email?: string | null;
};

export type CommentItem = {
  id: number;
  content: string;
  profiles?: CommentProfile | CommentProfile[] | null;
};

type CommentListProps = {
  postId: number;
  comments: CommentItem[];
  commentText: string;
  placeholder: string;
  sendText: string;
  anonymousText: string;
  authorInitial: string;
  onCommentChange: (postId: number, value: string) => void;
  onSubmitComment: (postId: number) => void;
};

/**
 * 评论区组件
 * 负责：
 * - 显示评论输入框
 * - 显示评论列表
 * - 发送评论按钮
 *
 * 注意：
 * 数据库新增评论逻辑仍然放在 forum/page.tsx，
 * 这里不直接操作 Supabase，方便后期维护。
 */
export default function CommentList({
  postId,
  comments,
  commentText,
  placeholder,
  sendText,
  anonymousText,
  authorInitial,
  onCommentChange,
  onSubmitComment,
}: CommentListProps) {
  return (
    <div className="forum-comments">
      <div className="forum-comment-composer">
        <div className="forum-mini-avatar">{authorInitial}</div>

        <input
          id={`comment-input-${postId}`}
          value={commentText}
          onChange={(event) => onCommentChange(postId, event.target.value)}
          placeholder={placeholder}
          className="forum-comment-input"
        />

        <button onClick={() => onSubmitComment(postId)} style={sendButton}>
          <Send size={16} />{sendText}
        </button>
      </div>

      <div className="forum-comment-list">
        {comments.map((comment) => {
          const profile = Array.isArray(comment.profiles)
            ? comment.profiles[0]
            : comment.profiles;

          const commentAuthor =
            profile?.display_name || profile?.email || anonymousText;

          return (
            <div key={comment.id} className="forum-comment-item">
              <strong>{commentAuthor}</strong>

              <p style={{ marginTop: 4 }}>{comment.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const sendButton = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  border: "none",
  background: "var(--green-800)",
  color: "white",
  padding: "10px 16px",
  borderRadius: "999px",
  cursor: "pointer",
  fontWeight: 700,
};
