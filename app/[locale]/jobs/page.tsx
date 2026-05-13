export default function JobsPage() {
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
          工作信息
        </h1>

        <p style={{ color: "#64748b", fontSize: "18px", marginBottom: "32px" }}>
          面向缅甸人的翻译、工厂、服务业和相关工作信息。
        </p>

        <div style={{ display: "grid", gap: "18px" }}>
          <div style={jobCard}>
            <h2>中缅翻译</h2>
            <p>适合会中文和缅语的人，可做现场翻译、项目协调。</p>
            <small>曼谷 · 全职 · 需要经验</small>
          </div>

          <div style={jobCard}>
            <h2>工厂协调员</h2>
            <p>负责中缅沟通、员工协调、资料翻译。</p>
            <small>泰国 · 全职 · 会中文优先</small>
          </div>

          <div style={jobCard}>
            <h2>服务业中文助手</h2>
            <p>适合会基础中文的缅甸人，负责客户沟通。</p>
            <small>曼谷 · 兼职/全职</small>
          </div>
        </div>
      </section>
    </main>
  );
}

const jobCard = {
  background: "white",
  padding: "26px",
  borderRadius: "18px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
};