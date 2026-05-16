/**
统计卡片
 */

type Props={

title:string
value:number

}

export default function AdminStatCard({

title,
value

}:Props){

return(

<div className="adminCard">

<div className="adminTitle">

{title}

</div>

<div className="adminValue">

{value}

</div>

</div>

)

}