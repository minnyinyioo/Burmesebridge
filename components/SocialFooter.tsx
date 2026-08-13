import { DiscordIcon, FacebookIcon, GitHubIcon, LineIcon, TelegramIcon, ViberIcon } from "@/components/icons/BrandIcons";

const links = [
  ["Facebook", process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/", FacebookIcon],
  ["GitHub", "https://github.com/minnyinyioo/Burmesebridge", GitHubIcon],
  ["Discord", process.env.NEXT_PUBLIC_DISCORD_URL || "https://discord.com/", DiscordIcon],
  ["Telegram", process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://telegram.org/", TelegramIcon],
  ["LINE", process.env.NEXT_PUBLIC_LINE_URL || "https://line.me/", LineIcon],
  ["Viber", process.env.NEXT_PUBLIC_VIBER_URL || "https://www.viber.com/", ViberIcon],
] as const;

export default function SocialFooter() { return <nav className="footer-socials" aria-label="BurmeseBridge social links">{links.map(([name, href, Icon]) => <a key={name} href={href} target="_blank" rel="noopener noreferrer" title={name} aria-label={name}><Icon width={20} height={20} /><span>{name}</span></a>)}</nav>; }
