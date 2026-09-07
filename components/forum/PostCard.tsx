"use client";

import { Heart, MessageCircle } from "lucide-react";
import Badge, { ProfileBadges } from "@/components/Badges";
import PostActions from "@/components/ui/PostActions";
import CommentList, { type CommentItem } from "./CommentList";
import ReportButton from "./ReportButton";
import VerifiedAvatar from "@/components/VerifiedAvatar";

type Profile = {
  display_name?: string | null;
  email?: string | null;
  verified?: boolean | null;
  badge?: string | null;
  role?: string | null;
  badges?: string[] | null;
  level?: number | null;
  avatar_url?: string | null;
  membership_badge?: string | null;
  membership_expires_at?: string | null;
};

type Post = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: Profile | Profile[] | null;
  tags?: string[];
  status?: "pending" | "published" | "hidden";
  is_pinned?: boolean;
  is_featured?: boolean;
};

type PostCardProps = {
  post: Post;
  currentUserId: string;
  likesCount: number;
  commentsCount: number;
  liked: boolean;
  comments: CommentItem[];
  commentText: string;
  locale: string;
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
  locale,
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

  const authorInitial = author.slice(0, 1).toUpperCase();

  return (
    <article
      id={`post-${post.id}`}
      className="feedCard forum-post-card"
    >
      <div className="forum-post-layout">
        <VerifiedAvatar name={author} avatarUrl={profile?.avatar_url} verified={profile?.verified} />

        <div className="forum-post-main">
          <div className="forum-author-row">
            <strong>{author}</strong>

            <ProfileBadges badges={profile?.badges} badge={profile?.badge} role={profile?.role} verified={profile?.verified} level={profile?.level} membershipBadge={profile?.membership_badge} membershipExpiresAt={profile?.membership_expires_at}/>
            {(post.is_pinned || post.is_featured || post.status === "pending") && <span className="forum-post-state-icons">
              {post.is_pinned && <Badge type="pinned" />}
              {post.is_featured && <Badge type="featured" />}
              {post.status === "pending" && <Badge type="pending" />}
            </span>}
          </div>

          <div className="forum-post-time">
            {new Date(post.created_at).toLocaleString()}
          </div>

          <div className="forum-post-content">
            {post.content}
            {!!post.tags?.length && <div className="forum-post-tags">{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}
          </div>

          <div className="forum-post-stats">
            <span><span className="forum-like-bubble"><Heart size={11} fill="currentColor" /></span>{likesCount} {labels.like}</span>
            <span><MessageCircle size={14} />{commentsCount} {labels.comment}</span>
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
            onComment={() => document.getElementById(`comment-input-${post.id}`)?.focus()}
            onShare={() => onShare(post.id)}
            onDelete={() => onDelete(post.id)}
          />
          {currentUserId !== post.user_id && <ReportButton postId={post.id} locale={locale} />}

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
