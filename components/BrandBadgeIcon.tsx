import type { ReactNode } from "react";

// Full-size silhouettes: no nested frames or tiny decorative strokes.
const symbols: Record<string, ReactNode> = {
  admin: <><path fill="#b3264b" d="M3 6.5 7.7 10 12 3l4.3 7L21 6.5l-2 12H5Z"/><path fill="#f7b3c6" d="m12 3 4.3 7L21 6.5l-2 12h-7Z"/><path fill="#831738" d="M5 19h14v2H5z"/><path fill="white" d="m12 10 2 3-2 3-2-3Z"/></>,
  moderator: <><path fill="#294f85" d="m12 2 9 4v6c0 5-5 9-9 11-4-2-9-6-9-11V6Z"/><path fill="#5585b9" d="m12 2 9 4v6c0 5-5 9-9 11Z"/><path stroke="white" strokeWidth="2.5" fill="none" d="M8 12h8m-4-4v8"/></>,
  verified: <><circle fill="#008060" cx="12" cy="12" r="10"/><circle fill="#0a9875" cx="12" cy="12" r="8.5"/><path stroke="white" strokeWidth="2.6" fill="none" d="m7.2 12 3.1 3.1 6.5-6.5"/></>,
  student: <><path fill="#087b91" d="M2 4h5c2 0 4 1 5 2 1-1 3-2 5-2h5v16h-5c-2 0-4 1-5 2-1-1-3-2-5-2H2Z"/><path fill="#b8eef0" d="M13 7c1-.8 2.5-1 4-1h3v12h-3c-1.5 0-3 .2-4 1Z"/><path stroke="white" strokeWidth="1.8" fill="none" d="M5 8h3m-3 4h3m4-5v12"/></>,
  teacher: <><path fill="#6840b8" d="M5 12v6c4 4 10 4 14 0v-6Z"/><path fill="#8d63d1" d="m1 8 11-6 11 6-11 6Z"/><path fill="#553096" d="m1 8 11 6v-4Z"/><path stroke="#513084" strokeWidth="2" fill="none" d="M22 9v8"/><circle fill="#513084" cx="22" cy="19" r="1.5"/></>,
  author: <><path fill="#b45309" d="M4 10 17 2l5 5-8 13-12 2Z"/><path fill="#efb867" d="m17 2 5 5-8 13-5-5Z"/><path stroke="white" strokeWidth="2" fill="none" d="m4 20 8-8"/><circle fill="white" cx="13" cy="11" r="2.2"/></>,
  company: <><path fill="#246697" d="M3 3h12v19H3Z"/><path fill="#74a3c1" d="M15 9h6v13h-6Z"/><path fill="white" d="M6 6h2v3H6zm4 0h2v3h-2zm-4 6h2v3H6zm4 0h2v3h-2zm-2 6h3v4H8zm9-6h2v3h-2z"/></>,
  member: <><circle fill="#c58a16" cx="12" cy="12" r="10"/><path fill="#f7d77b" d="M12 2a10 10 0 0 1 0 20Z"/><path fill="#fff2b8" d="m12 5 2 4.1 4.5.7-3.2 3.2.8 4.5-4.1-2.1-4.1 2.1.8-4.5-3.2-3.2 4.5-.7Z"/><circle fill="none" stroke="#9b6508" strokeWidth="1" cx="12" cy="12" r="10"/></>,
  vip: <><path fill="#8c5a04" d="m6 2 12 0 5 7-11 14L1 9Z"/><path fill="#e7b747" d="m6 2 6 7H1Zm12 0 5 7H12Z"/><path fill="#f8dda0" d="M6 2h12l-6 7Z"/><path fill="#bb841b" d="M1 9h11v14Z"/><path fill="#edc56d" d="M12 9h11L12 23Z"/><path stroke="white" strokeWidth="1.8" fill="none" d="m8 10 4 6 4-6"/></>,
  premium: <><path fill="#583287" d="m12 1 10 7-4 13H6L2 8Z"/><path fill="#9865c6" d="m12 1 10 7-10 14Z"/><path fill="#edcb77" d="m12 4 2.2 5.3L20 10l-4.4 3.8 1.3 5.7-4.9-3-4.9 3 1.3-5.7L4 10l5.8-.7Z"/></>,
  level: <><path fill="#b97c17" d="m12 1 9 5v12l-9 5-9-5V6Z"/><path fill="#f2d18a" d="m12 1 9 5-9 5-9-5Z"/><path fill="#dba441" d="m12 11 9-5v12l-9 5Z"/></>,
};

export default function BrandBadgeIcon({type,size=25}:{type:string;size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{display:"block",flexShrink:0,overflow:"visible"}} strokeLinecap="round" strokeLinejoin="round">{symbols[type] || symbols.member}</svg>;
}
