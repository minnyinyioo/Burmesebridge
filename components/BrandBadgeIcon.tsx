type Props = { type: string; size?: number };

const symbols: Record<string, React.ReactNode> = {
  admin: <path d="M8 15h8l1.3-6-3.2 2L12 6.5 9.9 11 6.7 9 8 15Z" />,
  moderator: <path d="M12 5.5 17 8v3.8c0 3-2 5.4-5 6.7-3-1.3-5-3.7-5-6.7V8l5-2.5Zm-2.2 6.2 1.5 1.5 3-3" />,
  verified: <path d="m8.5 12 2.2 2.2 4.8-5M12 4.8l2 1 2.2-.1 1 2 .1 2.2 1 2-1 2-.1 2.2-2.2.1-2 1-2-1-2.2-.1-.1-2.2-1-2 1-2 .1-2.2 2.2-.1 2-1Z" />,
  teacher: <path d="m5.5 9 6.5-3 6.5 3-6.5 3-6.5-3Zm2 2.2v3.3c2.8 1.8 6.2 1.8 9 0v-3.3" />,
  author: <path d="m7 17 2.8-.7 7-7-2.1-2.1-7 7L7 17Zm6.7-8.8 2.1 2.1" />,
  student: <path d="M12 6.5c-2.7 0-4.5 1.8-4.5 4.2 0 3.5 4.5 6.8 4.5 6.8s4.5-3.3 4.5-6.8c0-2.4-1.8-4.2-4.5-4.2Zm0 2v6" />,
  company: <path d="M6.5 18V7.5h7V18m0-7h4V18M9 10h2m-2 3h2m-2 3h2m6-2h-1" />,
  vip: <path d="m12 5.5 2 4 4.5.7-3.2 3.1.8 4.5-4.1-2.1-4.1 2.1.8-4.5-3.2-3.1 4.5-.7 2-4Z" />,
  premium: <path d="m12 5 5 4-5 9-5-9 5-4Zm-5 4h10m-7.5 0 2.5 9L14.5 9" />,
  member: <path d="M8 6.5h5c2 0 3.3 1 3.3 2.7 0 1.1-.6 1.9-1.6 2.3 1.3.3 2.1 1.3 2.1 2.7 0 2-1.5 3.3-3.9 3.3H8v-11Zm3 2.3v2h1.8c.8 0 1.2-.3 1.2-1s-.4-1-1.2-1H11Zm0 4.2v2.2h2c1 0 1.5-.4 1.5-1.1 0-.8-.5-1.1-1.5-1.1h-2Z" />,
};

export default function BrandBadgeIcon({ type, size = 17 }: Props) {
  return <svg className="brand-badge-svg" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path className="brand-badge-frame" d="M12 2.8 19.2 7v8L12 21.2 4.8 15V7L12 2.8Z" />{symbols[type] || symbols.member}</svg>;
}
