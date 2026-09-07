"use client";

import { useState } from "react";
import { Check, UserRound } from "lucide-react";
import { useParams } from "next/navigation";

const verifiedLabels = {
  my: "အတည်ပြုပြီး",
  zh: "已认证",
  en: "Verified",
} as const;

export default function VerifiedAvatar({name,avatarUrl,verified,size=52}:{name:string;avatarUrl?:string|null;verified?:boolean|null;size?:number}) {
  const locale=String(useParams().locale||"en") as keyof typeof verifiedLabels;
  const verifiedLabel=verifiedLabels[locale]||verifiedLabels.en;
  const initial=name.trim().slice(0,1).toUpperCase()||"?";
  const markSize=Math.max(15,Math.min(25,Math.round(size*.23)));
  const markInset=Math.max(1,Math.round(size*.05));
  const [showVerified,setShowVerified]=useState(false);
  return <span className="verified-avatar" style={{width:size,height:size}} aria-label={verified?`${name}, ${verifiedLabel}`:name}>
    {avatarUrl ? <span className="verified-avatar-image" style={{backgroundImage:"url("+avatarUrl+")"}} role="img" aria-label={name}/> : <span className="verified-avatar-fallback">{name.trim()?initial:<UserRound size={Math.max(20,size*.48)}/>}</span>}
    {verified ? <span className={`verified-avatar-mark${showVerified?" is-open":""}`} style={{width:markSize,height:markSize,right:markInset,bottom:markInset}} role="button" tabIndex={0} aria-label={verifiedLabel} data-tooltip={verifiedLabel} onClick={(event)=>{event.stopPropagation();setShowVerified(value=>!value)}} onKeyDown={(event)=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();setShowVerified(value=>!value)} if(event.key==="Escape")setShowVerified(false)}}><Check size={Math.max(10,Math.round(markSize*.62))} strokeWidth={3}/></span> : null}
  </span>;
}
