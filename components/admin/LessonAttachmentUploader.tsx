"use client";
import { ChangeEvent, useState } from "react";
import { FileUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { safeFileExtension, validateUpload } from "@/lib/fileValidation";
export default function LessonAttachmentUploader({locale,lessonId,onUploaded}:{locale:string;lessonId:number;onUploaded:()=>void}){
 const [busy,setBusy]=useState(false); const label=locale==="zh"?"上传 PDF 作业":locale==="my"?"PDF အိမ်စာ တင်ရန်":"Upload PDF homework";
 async function upload(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0]; if(!file||!(await validateUpload(file,["application/pdf"])))return;setBusy(true);const path=`${lessonId}/${crypto.randomUUID()}.${safeFileExtension(file)}`;const {error}=await supabase.storage.from("course-attachments").upload(path,file,{contentType:file.type});if(!error){await supabase.from("knowledge_lesson_attachments").insert({lesson_id:lessonId,title:file.name.slice(0,160),object_path:path,file_type:file.type,file_size:file.size});onUploaded();}setBusy(false);event.target.value="";}
 return <label className="lesson-attachment-upload"><FileUp size={15}/>{busy?"…":label}<input type="file" accept="application/pdf" disabled={busy} onChange={upload}/></label>;
}
