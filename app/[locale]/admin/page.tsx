import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

import {
canAccessAdmin
} from "@/lib/permissions";

import AdminSidebar
from "@/components/admin/AdminSidebar";

import AdminStatCard
from "@/components/admin/AdminStatCard";

/**
后台首页
 */

export default async function AdminPage(){

const {

data:{user}

}=await supabase.auth.getUser();

if(!user){

redirect("/")

}

const {data:profile}=await supabase

.from("profiles")

.select("role")

.eq(
"id",
user.id
)

.single()

if(

!canAccessAdmin(
profile?.role
)

){

redirect("/")

}

/**
真实统计
*/

const [

users,
posts

]=await Promise.all([

supabase
.from("profiles")
.select("*",{count:"exact",head:true}),

supabase
.from("posts")
.select("*",{count:"exact",head:true})

])

return(

<div className="adminShell">

<AdminSidebar/>

<div className="adminContent">

<h1>

Admin Dashboard

</h1>

<div
className="adminGrid"
>

<AdminStatCard

title="Users"

value={
users.count||0
}

/>

<AdminStatCard

title="Posts"

value={
posts.count||0
}

/>

</div>

</div>

</div>

)

}