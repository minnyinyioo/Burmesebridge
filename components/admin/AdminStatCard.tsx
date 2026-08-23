/**
统计卡片
 */

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
type Props={title:string;value:number;href?:string;icon?:LucideIcon}

export default function AdminStatCard({

title,
value,href,icon:Icon

}:Props){

const card=<div className="adminCard admin-stat-card">
{Icon&&<span className="admin-stat-icon"><Icon size={19}/></span>}

<div className="adminTitle">

{title}

</div>

<div className="adminValue">

{value}

</div>

</div>;
return href?<Link href={href} className="admin-stat-link">{card}</Link>:card;

}
