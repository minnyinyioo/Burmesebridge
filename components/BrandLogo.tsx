import Image from "next/image";

export default function BrandLogo({
  size = 34,
  showName = true,
  priority = false,
  className = "",
}: {
  size?: number;
  showName?: boolean;
  priority?: boolean;
  className?: string;
}) {
  return <span className={`brand-lockup ${className}`.trim()}>
    <Image
      className="brand-lockup-icon"
      src="/brand-icon.svg"
      width={size}
      height={size}
      alt={showName ? "" : "BurmeseBridge"}
      priority={priority}
    />
    {showName && <span className="brand-lockup-name">Burmese<span>Bridge</span></span>}
  </span>;
}
