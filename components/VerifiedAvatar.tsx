import { UserRound } from "lucide-react";

export default function VerifiedAvatar({name,avatarUrl,verified,size=52}:{name:string;avatarUrl?:string|null;verified?:boolean|null;size?:number}) {
  const initial=name.trim().slice(0,1).toUpperCase()||"?";
  const markSize=Math.max(15,Math.min(25,Math.round(size*.23)));
  return <span className="verified-avatar" style={{width:size,height:size}} aria-label={verified?name+", verified":name}>
    {avatarUrl ? <span className="verified-avatar-image" style={{backgroundImage:"url("+avatarUrl+")"}} role="img" aria-label={name}/> : <span className="verified-avatar-fallback">{name.trim()?initial:<UserRound size={Math.max(20,size*.48)}/>}</span>}
    {verified ? <span className="verified-avatar-mark" style={{width:markSize,height:markSize,fontSize:Math.max(9,Math.round(markSize*.62))}} aria-label="Verified">✓</span> : null}
  </span>;
}
