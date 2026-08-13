import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
} from "lucide-react";

import IconButton from "./IconButton";

type Props = {
  liked: boolean;
  likeLabel: string;
  likedLabel: string;
  commentLabel: string;
  shareLabel: string;
  deleteLabel: string;
  canDelete: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onDelete: () => void;
};

export default function PostActions({
  liked,
  likeLabel,
  likedLabel,
  commentLabel,
  shareLabel,
  deleteLabel,
  canDelete,
  onLike,
  onComment,
  onShare,
  onDelete,
}: Props) {
  return (
    <div className="feedActions">
      <IconButton
        icon={<Heart size={18} fill={liked ? "currentColor" : "none"} />}
        label={liked ? likedLabel : likeLabel}
        onClick={onLike}
        active={liked}
      />

      <IconButton
        icon={<MessageCircle size={18} />}
        label={commentLabel}
        onClick={onComment}
      />

      <IconButton
        icon={<Share2 size={18} />}
        label={shareLabel}
        onClick={onShare}
      />

      {canDelete && (
        <IconButton
          icon={<Trash2 size={18} />}
          label={deleteLabel}
          onClick={onDelete}
          danger
        />
      )}
    </div>
  );
}
