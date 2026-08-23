"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, FolderTree, GripVertical, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export type CourseSection = {
  id: number;
  product_id: number;
  title_my: string | null;
  title_zh: string | null;
  title_en: string | null;
  position: number;
  status: "draft" | "published";
};

export default function CourseSectionManager({ locale, productId, onChange }: { locale: string; productId: number; onChange?: (sections: CourseSection[]) => void }) {
  const copy = locale === "zh"
    ? { title:"章节", placeholder:"新章节标题", add:"添加章节", empty:"还没有章节。先创建章节，再把课时归入章节。", remove:"删除章节", confirm:"删除这个章节？课时会保留为未分组。" }
    : locale === "my"
      ? { title:"အခန်းများ", placeholder:"အခန်းခေါင်းစဉ်", add:"အခန်းထည့်ရန်", empty:"အခန်းမရှိသေးပါ။ အခန်းဖန်တီးပြီး သင်ခန်းစာများကို ထည့်ပါ။", remove:"အခန်းဖျက်ရန်", confirm:"ဤအခန်းကို ဖျက်မလား။ သင်ခန်းစာများ မပျက်ပါ။" }
      : { title:"Sections", placeholder:"New section title", add:"Add section", empty:"No sections yet. Create one, then assign lessons to it.", remove:"Delete section", confirm:"Delete this section? Its lessons will remain ungrouped." };
  const [title,setTitle]=useState("");
  const [items,setItems]=useState<CourseSection[]>([]);
  const [message,setMessage]=useState("");
  const [draggedId,setDraggedId]=useState<number|null>(null);
  const load=useCallback(async()=>{const {data,error}=await supabase.from("knowledge_course_sections").select("id,product_id,title_my,title_zh,title_en,position,status").eq("product_id",productId).order("position").order("id");if(error)setMessage(error.message);else{const next=(data||[]) as CourseSection[];setItems(next);onChange?.(next)}},[onChange,productId]);
  useEffect(()=>{
    // The remote request resolves before it updates component state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  },[load]);
  async function create(event:FormEvent){event.preventDefault();const suffix=locale==="zh"?"zh":locale==="en"?"en":"my";const {error}=await supabase.from("knowledge_course_sections").insert({product_id:productId,[`title_${suffix}`]:title.trim(),position:items.length,status:"published"});if(error)setMessage(error.message);else{setTitle("");setMessage("");await load()}}
  async function move(index:number,direction:-1|1){const target=items[index+direction];const current=items[index];if(!target)return;const [{error:a},{error:b}]=await Promise.all([supabase.from("knowledge_course_sections").update({position:target.position,updated_at:new Date().toISOString()}).eq("id",current.id),supabase.from("knowledge_course_sections").update({position:current.position,updated_at:new Date().toISOString()}).eq("id",target.id)]);const error=a||b;if(error)setMessage(error.message);else await load()}
  async function remove(id:number){if(!confirm(copy.confirm))return;const {error}=await supabase.from("knowledge_course_sections").delete().eq("id",id);if(error)setMessage(error.message);else await load()}
  async function dropOn(targetId:number){if(!draggedId||draggedId===targetId)return;const from=items.findIndex(item=>item.id===draggedId);const to=items.findIndex(item=>item.id===targetId);if(from<0||to<0)return;const reordered=[...items];const [moved]=reordered.splice(from,1);reordered.splice(to,0,moved);setItems(reordered);setDraggedId(null);const results=await Promise.all(reordered.map((item,index)=>supabase.from("knowledge_course_sections").update({position:index,updated_at:new Date().toISOString()}).eq("id",item.id)));const error=results.find(result=>result.error)?.error;if(error){setMessage(error.message);await load()}else onChange?.(reordered.map((item,index)=>({...item,position:index})))}
  const localTitle=(item:CourseSection)=>locale==="zh"?(item.title_zh||item.title_my||item.title_en):locale==="en"?(item.title_en||item.title_my||item.title_zh):(item.title_my||item.title_zh||item.title_en);
  return <section className="course-section-admin"><h3><FolderTree size={18}/>{copy.title}</h3><form onSubmit={create}><input required maxLength={160} value={title} onChange={event=>setTitle(event.target.value)} placeholder={copy.placeholder}/><button>{copy.add}</button></form>{message&&<p className="verification-message">{message}</p>} {!items.length&&<p>{copy.empty}</p>}<div>{items.map((item,index)=><article key={item.id} draggable onDragStart={()=>setDraggedId(item.id)} onDragEnd={()=>setDraggedId(null)} onDragOver={event=>event.preventDefault()} onDrop={()=>void dropOn(item.id)} className={draggedId===item.id?"is-dragging":""}><span><GripVertical size={15}/><b>{index+1}</b>{localTitle(item)}</span><div><button type="button" disabled={index===0} aria-label="Move section up" onClick={()=>move(index,-1)}><ArrowUp size={15}/></button><button type="button" disabled={index===items.length-1} aria-label="Move section down" onClick={()=>move(index,1)}><ArrowDown size={15}/></button><button type="button" aria-label={copy.remove} className="danger" onClick={()=>remove(item.id)}><Trash2 size={15}/></button></div></article>)}</div></section>;
}
