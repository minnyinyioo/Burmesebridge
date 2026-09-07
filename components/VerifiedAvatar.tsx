"use client";

import { useState } from "react";
import { Check, UserRound } from "lucide-react";

export default function VerifiedAvatar({name,avatarUrl,verified,size=52}:{name:string;avatarUrl?:string|null;verified?:boolean|null;size?:number}) {
  const initial=name.trim().slice(0,1).toUpperCase()||"?";
  const markSize=Math.max(15,Math.min(25,Math.round(size*.23)));
  const [showVerified,setShowVerified]=useState(false);
  return <span className="verified-avatar" style={{width:size,height:size}} aria-label={verified?name+", verified":name}>
    {avatarUrl ? <span className="verified-avatar-image" style={{backgroundImage:"url("+avatarUrl+")"}} role="img" aria-label={name}/> : <span className="verified-avatar-fallback">{name.trim()?initial:<UserRound size={Math.max(20,size*.48)}/>}</span>}
    {verified ? <span className={`verified-avatar-mark${showVerified?" is-open":""}`} style={{width:markSize,height:markSize}} role="button" tabIndex={0} aria-label="已认证 / Verified" data-tooltip="已认证 / Verified" onClick={(event)=>{event.stopPropagation();setShowVerified(value=>!value)}} onKeyDown={(event)=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();setShowVerified(value=>!value)} if(event.key==="Escape")setShowVerified(false)}}><Check size={Math.max(10,Math.round(markSize*.62))} strokeWidth={3}/></span> : null}
  </span>;
}
