import Badge, { LevelBadge, ProfileBadges } from "@/components/Badges";

export const metadata={title:"BurmeseBridge · Badge design reference",robots:{index:false,follow:false}};
export default function BadgePreview(){
  const types=["admin","moderator","verified","teacher","student","author","company","member","vip","premium"];
  return <main style={{maxWidth:920,margin:"40px auto",padding:24}}>
    <h1>BurmeseBridge · 徽章设计规范</h1>
    <p>实心双色 · 实际尺寸 · 悬停、点击或键盘聚焦查看身份</p>
    {[false,true].map(dark=><section key={String(dark)} style={{padding:24,marginTop:24,borderRadius:16,background:dark?"#152d28":"#fff",color:dark?"#eef8f4":"#173b32",border:"1px solid #879d9433"}}>
      <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>{types.map(type=><div key={type} style={{display:"grid",justifyItems:"center",gap:10}}><Badge type={type}/><small>{type}</small></div>)}</div>
      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginTop:28}}><strong>BB_Admin</strong><ProfileBadges badges={["admin","verified","teacher","student","vip"]} level={4}/></div>
      <div style={{display:"flex",gap:10,marginTop:20}}>{[1,4,10,25,100].map(level=><LevelBadge key={level} level={level}/>)}</div>
    </section>)}
  </main>;
}
