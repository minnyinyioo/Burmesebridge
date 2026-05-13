export default function ForumPage() {
  return (
    <main
      style={{
        padding: "48px 24px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "42px", marginBottom: "12px" }}>
          社区论坛
        </h1>

        <p style={{ color: "#64748b", fontSize: "18px", marginBottom: "32px" }}>
          提问、分享学习经验、交流中文和工作生活信息。
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "24px",
          }}
        >
          <div style={{ display: "grid", gap: "16px" }}>
            <div style={postCard}>
              <h2>零基础怎么开始学中文？</h2>
              <p>适合初学者的学习路线和每日练习方法。</p>
              <small>评论 12 · 点赞 36</small>
            </div>

            <div style={postCard}>
              <h2>工厂上班常用中文句子</h2>
              <p>老板、主管、同事之间常用表达。</p>
              <small>评论 8 · 点赞 24</small>
            </div>

            <div style={postCard}>
              <h2>在泰国生活常用中文</h2>
              <p>购物、交通、租房、医院常用中文。</p>
              <small>评论 5 · 点赞 18</small>
            </div>
          </div>

          <aside style={sideCard}>
            <h2>论坛分类</h2>
            <p>中文口语</p>
            <p>打工中文</p>
            <p>生活交流</p>
            <p>资源分享</p>
          </aside>
        </div>
      </section>
    </main>
  );
}

const postCard = {
  background: "white",
  padding: "24px",
  borderRadius: "18px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
};

const sideCard = {
  background: "white",
  padding: "24px",
  borderRadius: "18px",
  border: "1px solid #e2e8f0",
  height: "fit-content",
};