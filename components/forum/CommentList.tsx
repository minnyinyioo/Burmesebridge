type CommentProfile = {
  display_name?: string | null;
  email?: string | null;
};

type CommentItem = {
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
    <div
      style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <div style={miniAvatar}>{authorInitial}</div>

        <input
          value={commentText}
          onChange={(event) => onCommentChange(postId, event.target.value)}
          placeholder={placeholder}
          style={commentInput}
        />

        <button onClick={() => onSubmitComment(postId)} style={sendButton}>
          {sendText}
        </button>
      </div>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gap: "10px",
        }}
      >
        {comments.map((comment) => {
          const profile = Array.isArray(comment.profiles)
            ? comment.profiles[0]
            : comment.profiles;

          const commentAuthor =
            profile?.display_name || profile?.email || anonymousText;

          return (
            <div key={comment.id} style={commentBox}>
              <strong>{commentAuthor}</strong>

              <p style={{ marginTop: 4 }}>{comment.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const miniAvatar = {
  width: 34,
  height: 34,
  borderRadius: "999px",
  background: "#2563eb",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
};

const commentInput = {
  flex: 1,
  padding: "12px 16px",
  borderRadius: "999px",
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
};

const sendButton = {
  border: "none",
  background: "#2563eb",
  color: "white",
  padding: "10px 16px",
  borderRadius: "999px",
  cursor: "pointer",
  fontWeight: 700,
};

const commentBox = {
  background: "#f8fafc",
  padding: "12px",
  borderRadius: "16px",
};