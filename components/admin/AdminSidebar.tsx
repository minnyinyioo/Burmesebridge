/**
 * Admin 左侧导航
 */

import Link from "next/link";
import {
LayoutDashboard,
Users,
Newspaper,
MessageSquare,
Shield
} from "lucide-react";

export default function AdminSidebar(){

const items=[

{
label:"Dashboard",
icon:LayoutDashboard,
href:"/zh/admin"
},

{
label:"Users",
icon:Users,
href:"/zh/admin/users"
},

{
label:"Posts",
icon:MessageSquare,
href:"/zh/admin/posts"
},

{
label:"News",
icon:Newspaper,
href:"/zh/admin/news"
},

{
label:"Ban Center",
icon:Shield,
href:"/zh/admin/ban"
}

]

return(

<div className="adminSidebar">

{items.map(item=>{

const Icon=item.icon

return(

<Link
key={item.href}
href={item.href}
className="adminLink"
>

<Icon size={18}/>

<span>
{item.label}
</span>

</Link>

)

})}

</div>

)

}