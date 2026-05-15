"use client";

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
        style={textarea}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 14,
        }}
      >
        <button onClick={onSubmit} style={primaryButton}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}

const textarea = {
  width: "100%",
  minHeight: "120px",
  padding: "16px",
  borderRadius: "16px",
  border: "1px solid #cbd5e1",
  resize: "none" as const,
  fontSize: "16px",
  outline: "none",
};

const primaryButton = {
  padding: "12px 22px",
  borderRadius: "999px",
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};