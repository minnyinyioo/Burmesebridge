"use client";

import { Send } from "lucide-react";

type PostComposerProps = {
  content: string;
  placeholder: string;
  buttonText: string;
  onContentChange: (value: string) => void;
  onSubmit: () => void;
};

/**
 * 发帖输入框组件
 * 只负责 UI：
 * - 输入帖子内容
 * - 点击发布按钮
 *
 * 真正的数据库写入逻辑放在 forum/page.tsx 里，
 * 这样后期更容易维护。
 */
export default function PostComposer({
  content,
  placeholder,
  buttonText,
  onContentChange,
  onSubmit,
}: PostComposerProps) {
  return (
    <div className="feedComposer">
      <textarea
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        placeholder={placeholder}
        className="forum-post-textarea"
      />

      <div className="forum-composer-footer">
        <button onClick={onSubmit} className="forum-post-submit" disabled={!content.trim()}>
          <Send size={17} />{buttonText}
        </button>
      </div>
    </div>
  );
}
