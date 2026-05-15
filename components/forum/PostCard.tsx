"use client";

import Badge from "@/components/Badges";
import PostActions from "@/components/ui/PostActions";
import CommentList from "./CommentList";

type Profile = {
  display_name?: string | null;
  email?: string | null;
  verified?: boolean | null;
  badge?: string | null;
};

type Post = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: Profile | Profile[] | null;
};

type PostCardProps = {
  post: Post;
  currentUserId: string;
  likesCount: number;
  commentsCount: number;
  liked: boolean;
  comments: any[];
  commentText: string;
  labels: {
    anonymous: string;
    like: string;
    liked: string;
    comment: string;
    share: string;
    delete: string;
    commentPlaceholder: string;
    send: string;
  };
  onLike: (postId: number) => void;
  onShare: (postId: number) => void;
  onDelete: (postId: number) => void;
  onCommentChange: (postId: number, value: string) => void;
  onSubmitComment: (postId: number) => void;
};

/**
 * 单个帖子卡片组件
 *
 * 负责显示：
 * - 作者头像
 * - 作者名称
 * - 认证 / 身份徽章
 * - 帖子内容
 * - 点赞 / 评论 / 分享 / 删除
 * - 评论列表
 *
 * 注意：
 * 这里不直接操作 Supabase。
 * 所有数据库逻辑都由 forum/page.tsx 传进来。
 */
export default function PostCard({
  post,
  currentUserId,
  likesCount,
  commentsCount,
  liked,
  comments,
  commentText,
  labels,
  onLike,
  onShare,
  onDelete,
  onCommentChange,
  onSubmitComment,
}: PostCardProps) {
  const profile = getProfile(post);

  const author =
    profile?.display_name ||
    profile?.email ||
    labels.anonymous;

  const badge = profile?.badge || "member";
  const authorInitial = author.slice(0, 1).toUpperCase();

  return (
    <article
      id={`post-${post.id}`}
      className="feedCard"
    >
      <div
        style={{
          display: "flex",
          gap: 14,
        }}
      >
        <div style={avatar}>{authorInitial}</div>

        <div style={{ flex: 1 }}>
          <div style={authorRow}>
            <strong>{author}</strong>

            {profile?.verified && (
              <Badge type="verified" />
            )}

            <Badge type={badge as any} />
          </div>

          <div style={timeText}>
            {new Date(post.created_at).toLocaleString()}
          </div>

          <div style={postContent}>
            {post.content}
          </div>

          <div style={statsRow}>
            <span>
              {likesCount} {labels.like}
            </span>

            <span>
              {commentsCount} {labels.comment}
            </span>
          </div>

          <PostActions
            liked={liked}
            likeLabel={labels.like}
            likedLabel={labels.liked}
            commentLabel={labels.comment}
            shareLabel={labels.share}
            deleteLabel={labels.delete}
            canDelete={currentUserId === post.user_id}
            onLike={() => onLike(post.id)}
            onShare={() => onShare(post.id)}
            onDelete={() => onDelete(post.id)}
          />

          <CommentList
            postId={post.id}
            comments={comments}
            commentText={commentText}
            placeholder={labels.commentPlaceholder}
            sendText={labels.send}
            anonymousText={labels.anonymous}
            authorInitial={authorInitial}
            onCommentChange={onCommentChange}
            onSubmitComment={onSubmitComment}
          />
        </div>
      </div>
    </article>
  );
}

/**
 * Supabase relation 有时返回 object，有时返回 array。
 * 这里统一处理，避免页面报类型错误。
 */
function getProfile(post: Post): Profile | null {
  if (Array.isArray(post.profiles)) {
    return post.profiles[0] || null;
  }

  return post.profiles || null;
}

const avatar = {
  minWidth: "52px",
  width: "52px",
  height: "52px",
  borderRadius: "999px",
  background: "linear-gradient(135deg,#2563eb,#7c3aed)",
  color: "white",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: 800,
  fontSize: "18px",
};

const authorRow = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap" as const,
  color: "#0f172a",
};

const timeText = {
  color: "#94a3b8",
  fontSize: "13px",
  marginTop: "4px",
};

const postContent = {
  marginTop: "16px",
  color: "#0f172a",
  fontSize: "16px",
  lineHeight: 1.9,
  whiteSpace: "pre-wrap" as const,
};

const statsRow = {
  marginTop: "16px",
  display: "flex",
  gap: "16px",
  color: "#64748b",
  fontSize: "14px",
};