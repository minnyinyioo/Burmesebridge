"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import {
  BadgeCheck,
  Crown,
  Shield,
  GraduationCap,
  Star,
  UserRound,
  Pin,
  Flame,
  Sparkles,
  Building2,
  PenLine,
} from "lucide-react";

export type BadgeType =
  | "verified"
  | "moderator"
  | "admin"
  | "teacher"
  | "student"
  | "company"
  | "author"
  | "vip"
  | "member"
  | "pinned"
  | "hot"
  | "featured";

export default function Badge({
  type,
}:{
  type:BadgeType
}){

const params=useParams();

const locale=String(
params.locale||"en"
);

const [show,setShow]=useState(false);

const labels={

my:{
verified:"အတည်ပြုပြီး",
moderator:"စီမံခန့်ခွဲသူ",
admin:"အက်မင်",
teacher:"ဆရာ",
student:"ကျောင်းသား",
company:"ကုမ္ပဏီ",
author:"စာရေးသူ",
vip:"VIP",
member:"အသင်းဝင်",
pinned:"ထိပ်ဆုံးပို့စ်",
hot:"လူကြိုက်များ",
featured:"အကြံပြု"
},

zh:{
verified:"已认证",
moderator:"版主",
admin:"管理员",
teacher:"老师",
student:"学生",
company:"企业",
author:"作者",
vip:"VIP",
member:"会员",
pinned:"置顶",
hot:"热门",
featured:"推荐"
},

en:{
verified:"Verified",
moderator:"Moderator",
admin:"Admin",
teacher:"Teacher",
student:"Student",
company:"Company",
author:"Author",
vip:"VIP",
member:"Member",
pinned:"Pinned",
hot:"Hot",
featured:"Featured"
}

};

const text=
labels[
locale as keyof typeof labels
] || labels.en;

const badges={

verified:{
icon:<BadgeCheck size={16}/>,
color:"var(--brand-primary)"
},

moderator:{
icon:<Shield size={16}/>,
color:"#f59e0b"
},

admin:{
icon:<Crown size={16}/>,
color:"#dc2626"
},

teacher:{
icon:<GraduationCap size={16}/>,
color:"#7c3aed"
},
student:{
icon:<GraduationCap size={16}/>,
color:"#0e7561"
},

company:{
icon:<Building2 size={16}/>,
color:"#0f766e"
},

author:{
icon:<PenLine size={16}/>,
color:"#b45309"
},

vip:{
icon:<Star size={16}/>,
color:"#d97706"
},

member:{
icon:<UserRound size={16}/>,
color:"#64748b"
},
pinned: {
  icon: <Pin size={16} />,
  color: "#4f46e5",
},

hot: {
  icon: <Flame size={16} />,
  color: "#dc2626",
},

featured: {
  icon: <Sparkles size={16} />,
  color: "#ca8a04",
},

};

const item=
badges[type] ||
badges.member;

return(

<div
style={{
position:"relative",
display:"inline-block"
}}

onMouseEnter={()=>
setShow(true)
}

onMouseLeave={()=>
setShow(false)
}

onClick={()=>
setShow(!show)
}

>

<div
style={{
display:"flex",
alignItems:"center",
justifyContent:"center",
width:34,
height:34,
borderRadius:"999px",
background:"white",
color:item.color,

boxShadow:
`0 0 14px ${item.color}55`,

cursor:"pointer",

transition:
"all .25s"
}}
>

{item.icon}

</div>

{show && (

<div
style={{

position:"absolute",

top:"-42px",

left:"50%",

transform:
"translateX(-50%)",

background:"#0f172a",

color:"white",

padding:"6px 10px",

borderRadius:"10px",

fontSize:"12px",

fontWeight:700,

whiteSpace:"nowrap",

zIndex:9999
}}
>

{text[type]}

</div>

)}

</div>

)

}
