"use client";

import { useParams } from "next/navigation";
import { useId, useState, type ReactNode } from "react";
import { Flame, Pin, Sparkles } from "lucide-react";
import BrandBadgeIcon from "@/components/BrandBadgeIcon";
import styles from "./Badges.module.css";

export type BadgeType = "verified"|"moderator"|"admin"|"teacher"|"student"|"company"|"author"|"vip"|"premium"|"member"|"pinned"|"hot"|"featured";
const labels={my:{verified:"အတည်ပြုပြီး",moderator:"စီမံခန့်ခွဲသူ",admin:"အက်မင်",teacher:"ဆရာ",student:"ကျောင်းသား",company:"ကုမ္ပဏီ",author:"စာရေးသူ",vip:"VIP",premium:"Premium",member:"အသင်းဝင်",pinned:"ထိပ်ဆုံးပို့စ်",hot:"လူကြိုက်များ",featured:"အကြံပြု"},zh:{verified:"已认证",moderator:"版主",admin:"管理员",teacher:"老师",student:"学生",company:"企业",author:"作者",vip:"VIP会员",premium:"高级会员",member:"会员",pinned:"置顶",hot:"热门",featured:"推荐"},en:{verified:"Verified",moderator:"Moderator",admin:"Admin",teacher:"Teacher",student:"Student",company:"Company",author:"Author",vip:"VIP",premium:"Premium",member:"Member",pinned:"Pinned",hot:"Hot",featured:"Featured"}};
const contentIcons = {pinned:Pin, hot:Flame, featured:Sparkles};
const order = ["admin","moderator","verified","teacher","student","author","company","member","vip","premium"];

function BadgeTrigger({label, children, premium=false}:{label:string;children:ReactNode;premium?:boolean}) {
  const id=useId();
  const [hovered,setHovered]=useState(false);
  const [focused,setFocused]=useState(false);
  const [pinned,setPinned]=useState(false);
  const [dismissed,setDismissed]=useState(false);
  const visible=!dismissed && (hovered || focused || pinned);
  return <span className={styles.item}
    onMouseEnter={()=>{setHovered(true);setDismissed(false)}}
    onMouseLeave={()=>setHovered(false)}>
    <button type="button" className={styles.trigger} aria-label={label}
      aria-describedby={visible?id:undefined} aria-expanded={visible}
      onFocus={()=>{setFocused(true);setDismissed(false)}}
      onBlur={()=>{setFocused(false);setPinned(false)}}
      onClick={()=>{setPinned(!pinned);setDismissed(pinned)}}
      onKeyDown={event=>{if(event.key==="Escape"){setDismissed(true);setPinned(false)}}}>
      <span className={styles.art}>{children}{premium?<i className={styles.sparkle} aria-hidden="true">✦</i>:null}</span>
    </button>
    {visible?<span id={id} className={styles.tooltip} role="tooltip">{label}</span>:null}
  </span>;
}

export default function Badge({type,labelOverride}:{type:BadgeType|string;labelOverride?:string}) {
  const locale=String(useParams().locale||"en") as keyof typeof labels;
  const known=(Object.hasOwn(labels.en,type)?type:"member") as BadgeType;
  const label=labelOverride||labels[locale]?.[known]||labels.en[known];
  const Icon=contentIcons[known as keyof typeof contentIcons];
  return <BadgeTrigger label={label} premium={known==="admin"||known==="vip"||known==="premium"}>
    {Icon?<Icon size={23}/>:<BrandBadgeIcon type={known}/>}
  </BadgeTrigger>;
}

export function LevelBadge({level}:{level:number}) {
  const locale=String(useParams().locale||"en");
  const rank=Number.isFinite(level)?Math.max(1,Math.floor(level)):1;
  const label=locale==="zh"?`成长等级 LV.${rank}`:locale==="my"?`အဆင့် LV.${rank}`:`Activity level LV.${rank}`;
  return <BadgeTrigger label={label} premium={rank>=10}>
    <BrandBadgeIcon type="level" size={28}/>
    <b className={styles.level} data-long={rank>99}>{rank}</b>
  </BadgeTrigger>;
}

export function ProfileBadges({badges,badge,role,verified,level}:{badges?:string[]|null;badge?:string|null;role?:string|null;verified?:boolean|null;level?:number|null}) {
  const ids=new Set<string>();
  (badges||[]).forEach(value=>{const key=value.trim().toLowerCase();if(key)ids.add(key)});
  if(role && role!=="member")ids.add(role.toLowerCase());
  if(badge)ids.add(badge.toLowerCase());
  if(verified)ids.add("verified");
  if(!ids.size)ids.add("member");
  const identities=Array.from(ids).sort((a,b)=>(order.indexOf(a)<0?99:order.indexOf(a))-(order.indexOf(b)<0?99:order.indexOf(b))||a.localeCompare(b));
  return <span className={styles.group} aria-label="Account badges">
    {identities.map(type=><Badge key={type} type={type} labelOverride={Object.hasOwn(labels.en,type)?undefined:type}/>)}
    {level?<LevelBadge level={level}/>:null}
  </span>;
}
