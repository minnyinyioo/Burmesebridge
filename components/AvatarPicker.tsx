"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Check, ImagePlus, Settings, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { safeFileExtension, validateUpload } from "@/lib/fileValidation";
import VerifiedAvatar from "@/components/VerifiedAvatar";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const systemAvatars = [
  { id: "aurora", label: "Aurora", src: "/avatars/system-aurora.svg" },
  { id: "lotus", label: "Lotus", src: "/avatars/system-lotus.svg" },
  { id: "sapphire", label: "Sapphire", src: "/avatars/system-sapphire.svg" },
  { id: "sunrise", label: "Sunrise", src: "/avatars/system-sunrise.svg" },
  { id: "jade", label: "Jade", src: "/avatars/system-jade.svg" },
  { id: "cosmos", label: "Cosmos", src: "/avatars/system-cosmos.svg" },
];

type Copy = { title:string;system:string;custom:string;choose:string;upload:string;saving:string;saved:string;invalid:string;hint:string;open:string;cancel:string;confirm:string;success:string;unchanged:string;preview:string };

export default function AvatarPicker({locale,userId,name,avatarUrl,verified,onSaved}:{locale:string;userId:string;name:string;avatarUrl:string|null;verified:boolean;onSaved:(url:string)=>void}) {
  const copy:Copy = locale === "zh"
    ? {title:"更换头像",system:"系统头像",custom:"自定义头像",choose:"选择头像",upload:"上传图片",saving:"保存中…",saved:"头像已更新",invalid:"请选择 JPG、PNG 或 WEBP 图片，且不超过 2MB。",hint:"选择系统头像或上传自定义图片，确认后才会保存。",open:"更换头像",cancel:"取消",confirm:"确认更换",success:"头像修改成功",unchanged:"请选择一个新头像。",preview:"当前预览"}
    : locale === "my"
      ? {title:"ပရိုဖိုင်ပုံ ပြောင်းရန်",system:"စနစ်ပုံများ",custom:"ကိုယ်ပိုင်ပုံ",choose:"ပုံရွေးရန်",upload:"ပုံတင်ရန်",saving:"သိမ်းနေသည်…",saved:"ပရိုဖိုင်ပုံ ပြောင်းပြီးပါပြီ",invalid:"JPG၊ PNG သို့မဟုတ် WEBP ပုံ (2MB အောက်) ကို ရွေးပါ။",hint:"စနစ်ပုံ သို့မဟုတ် ကိုယ်ပိုင်ပုံကို ရွေးပြီး အတည်ပြုမှ သိမ်းမည်။",open:"ပုံပြောင်းရန်",cancel:"မလုပ်တော့ပါ",confirm:"အတည်ပြုရန်",success:"ပရိုဖိုင်ပုံ ပြောင်းပြီးပါပြီ",unchanged:"ပုံအသစ်တစ်ခု ရွေးပါ။",preview:"ကြိုတင်ကြည့်ရန်"}
      : {title:"Change avatar",system:"System avatars",custom:"Custom avatar",choose:"Choose avatar",upload:"Upload image",saving:"Saving…",saved:"Avatar updated",invalid:"Choose a JPG, PNG, or WEBP image under 2MB.",hint:"Choose a system avatar or upload a custom image. It saves only after confirmation.",open:"Change avatar",cancel:"Cancel",confirm:"Confirm change",success:"Avatar updated successfully",unchanged:"Choose a new avatar first.",preview:"Preview"};
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [selected,setSelected]=useState(avatarUrl || systemAvatars[0].src);
  const [file,setFile]=useState<File|null>(null);
  const [preview,setPreview]=useState("");
  const displayUrl=preview || selected || avatarUrl || null;

  useEffect(()=>setSelected(avatarUrl || systemAvatars[0].src),[avatarUrl]);
  useEffect(()=>{
    if(!file){setPreview("");return}
    const next=URL.createObjectURL(file);
    setPreview(next);
    return()=>URL.revokeObjectURL(next);
  },[file]);

  async function save(url:string) {
    if (!userId || busy) return false;
    setBusy(true); setError(""); setMessage("");
    const {error:saveError}=await supabase.from("profiles").update({avatar_url:url}).eq("id",userId);
    setBusy(false);
    if (saveError) { setError(saveError.message); return false; }
    onSaved(url); setMessage(copy.success); return true;
  }

  async function upload(event:ChangeEvent<HTMLInputElement>) {
    const file=event.target.files?.[0]; event.target.value="";
    if (!file) return;
    if (file.size>2*1024*1024 || !(await validateUpload(file,["image/jpeg","image/png","image/webp"]))) { setError(copy.invalid); return; }
    setError("");setMessage("");setFile(file);
  }

  async function confirm() {
    if (busy) return;
    setError("");setMessage("");
    if (file) {
      setBusy(true);
      const path=`${userId}/${crypto.randomUUID()}.${safeFileExtension(file)}`;
      const {error:uploadError}=await supabase.storage.from("avatars").upload(path,file,{contentType:file.type,upsert:false});
      if (uploadError) { setBusy(false); setError(uploadError.message); return; }
      const {data}=supabase.storage.from("avatars").getPublicUrl(path);
      setBusy(false);
      if(await save(data.publicUrl)){setFile(null);setOpen(false)}
      return;
    }
    if (!selected || selected===avatarUrl) { setError(copy.unchanged); return; }
    if(await save(selected))setOpen(false);
  }

  const selectedLabel=useMemo(()=>systemAvatars.find(item=>item.src===selected)?.label || copy.custom,[selected,copy.custom]);

  return <>
    <button type="button" className="account-avatar-action" onClick={()=>{setOpen(true);setError("");setMessage("");setFile(null);setSelected(avatarUrl || systemAvatars[0].src)}}><Settings size={16}/>{copy.open}</button>
    {message?<p className="avatar-picker-message" role="status">{message}</p>:null}
    <Dialog open={open} onOpenChange={(value)=>{if(!busy)setOpen(value)}}>
      <DialogContent className="avatar-dialog">
        <DialogTitle>{copy.title}</DialogTitle>
        <DialogDescription>{copy.hint}</DialogDescription>
        <section className="avatar-picker" aria-label={copy.title}>
          <div className="avatar-picker-head"><div><h2>{copy.preview}</h2><p>{selectedLabel}</p></div><VerifiedAvatar name={name} avatarUrl={displayUrl} verified={verified} size={72}/></div>
          <h3>{copy.system}</h3>
          <div className="avatar-picker-grid">{systemAvatars.map(item=><button key={item.id} type="button" className={!file&&selected===item.src?"is-selected":""} onClick={()=>{setFile(null);setSelected(item.src);setError("");setMessage("")}} disabled={busy} aria-label={`${copy.choose}: ${item.label}`}><VerifiedAvatar name={item.label} avatarUrl={item.src} size={54}/>{!file&&selected===item.src?<span className="avatar-picker-check"><Check size={13}/></span>:null}</button>)}</div>
          <label className="avatar-upload"><ImagePlus size={18}/><span>{copy.custom}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={busy}/><b>{busy?copy.saving:copy.upload}</b><Upload size={16}/></label>
          {error?<p className="avatar-picker-error" role="alert">{error}</p>:null}
          <div className="avatar-dialog-actions"><button type="button" onClick={()=>setOpen(false)} disabled={busy}>{copy.cancel}</button><button type="button" className="primary" onClick={()=>void confirm()} disabled={busy}>{busy?copy.saving:copy.confirm}</button></div>
        </section>
      </DialogContent>
    </Dialog>
  </>;
}
