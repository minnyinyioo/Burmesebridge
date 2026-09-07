type Props={type:string;size?:number};

const frames:Record<string,React.ReactNode>={
  admin:<path className="brand-badge-frame" d="M12 2.7 19 6.8v8.4L12 21l-7-5.8V6.8L12 2.7Z"/>,
  moderator:<path className="brand-badge-frame" d="M12 3.2 19 6v5.7c0 4.3-2.7 7.5-7 9.3-4.3-1.8-7-5-7-9.3V6l7-2.8Z"/>,
  verified:<path className="brand-badge-frame" d="m12 2.8 2.3 1.5 2.8-.1.8 2.7 2.3 1.6-1 2.6 1 2.6-2.3 1.6-.8 2.7-2.8-.1L12 21.2l-2.3-1.5-2.8.1-.8-2.7-2.3-1.6 1-2.6-1-2.6 2.3-1.6.8-2.7 2.8.1L12 2.8Z"/>,
  vip:<path className="brand-badge-frame" d="m12 2.8 7.2 6.1L12 21.2 4.8 8.9 12 2.8Z"/>,
  premium:<path className="brand-badge-frame" d="m12 2.8 7.2 6.1L12 21.2 4.8 8.9 12 2.8Z"/>,
  member:<circle className="brand-badge-frame" cx="12" cy="12" r="8.7"/>,
};
const roleFrame=<path className="brand-badge-frame" d="M6.2 4.2h11.6a2 2 0 0 1 2 2v11.6a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2V6.2a2 2 0 0 1 2-2Z"/>;
const symbols:Record<string,React.ReactNode>={
 admin:<><path d="M7.5 15.8h9l1.1-6-3.5 2.1L12 7.1l-2.1 4.8-3.5-2.1 1.1 6Z"/><path d="M8.2 17.5h7.6"/></>,
 moderator:<><path d="m8.4 12 2.2 2.2 5-5"/><path d="M12 6.4v1"/></>,
 verified:<path d="m7.8 12.1 2.7 2.7 5.8-6"/>,
 teacher:<><path d="m5.7 9.2 6.3-3 6.3 3-6.3 3-6.3-3Z"/><path d="M8 11.1v3.5c2.5 1.6 5.5 1.6 8 0v-3.5"/><path d="M18.3 9.2v4"/></>,
 student:<><path d="M7.2 7.2h4.1c1.6 0 2.7.8 2.7 2.2v7.4c0-1.3-1.1-2.1-2.7-2.1H7.2V7.2Z"/><path d="M16.8 7.2H14c-1.6 0-2.7.8-2.7 2.2v5.3"/></>,
 author:<><path d="m7 17 3-.8 7-7-2.2-2.2-7 7L7 17Z"/><path d="m13.7 8.1 2.2 2.2"/></>,
 company:<><path d="M6.5 18V7.2h7.2V18m0-7h3.8v7M9 10h2m-2 3h2m-2 3h2m5-2h-1"/></>,
 vip:<><path d="M7 9.1h10l-5 8.3-5-8.3Z"/><path d="m7 9.1 2.5-2.5L12 9l2.5-2.4L17 9.1M9.5 6.6h5"/></>,
 premium:<><path d="m12 5 5 4-5 9-5-9 5-4Z"/><path d="M7 9h10m-7.5 0L12 18 14.5 9"/></>,
 member:<path d="M8.2 6.8h4.6c2 0 3.2 1 3.2 2.6 0 1.1-.6 1.9-1.7 2.3 1.3.3 2.1 1.2 2.1 2.6 0 1.9-1.5 3-3.7 3H8.2V6.8Zm2.6 2.2v1.8h1.7c.7 0 1.1-.3 1.1-.9s-.4-.9-1.1-.9h-1.7Zm0 4v2h1.8c.9 0 1.4-.4 1.4-1s-.5-1-1.4-1h-1.8Z"/>,
};

export default function BrandBadgeIcon({type,size=22}:Props){const key=type in symbols?type:"member";return <svg className={`brand-badge-svg brand-badge-svg-${key}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{frames[key]||roleFrame}{symbols[key]}</svg>}
