type BadgeType =
  | "verified"
  | "moderator"
  | "admin"
  | "teacher"
  | "vip"
  | "member";

export default function Badge({
  type,
}: {
  type: BadgeType;
}) {
  const badges = {
    verified: {
      label: "Verified",
      bg: "#2563eb",
      icon: "✓",
    },
    moderator: {
      label: "Moderator",
      bg: "#f59e0b",
      icon: "M",
    },
    admin: {
      label: "Admin",
      bg: "#dc2626",
      icon: "A",
    },
    teacher: {
      label: "Teacher",
      bg: "#7c3aed",
      icon: "T",
    },
    vip: {
      label: "VIP",
      bg: "#d97706",
      icon: "V",
    },
    member: {
      label: "Member",
      bg: "#64748b",
      icon: "U",
    },
  };

  const badge = badges[type];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 9px",
        borderRadius: "999px",
        background: badge.bg,
        color: "white",
        fontSize: "12px",
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      <span
        style={{
          width: "15px",
          height: "15px",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.22)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
        }}
      >
        {badge.icon}
      </span>
      {badge.label}
    </span>
  );
}