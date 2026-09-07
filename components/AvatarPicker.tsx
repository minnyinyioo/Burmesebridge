"use client";

import { ChangeEvent, useState } from "react";
import { Check, ImagePlus, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { safeFileExtension, validateUpload } from "@/lib/fileValidation";
import VerifiedAvatar from "@/components/VerifiedAvatar";

const systemAvatars = [
  { id: "aurora", label: "Aurora", src: "/avatars/system-aurora.svg" },
  { id: "lotus", label: "Lotus", src: "/avatars/system-lotus.svg" },
  { id: "sapphire", label: "Sapphire", src: "/avatars/system-sapphire.svg" },
  { id: "sunrise", label: "Sunrise", src: "/avatars/system-sunrise.svg" },
  { id: "jade", label: "Jade", src: "/avatars/system-jade.svg" },
  { id: "cosmos", label: "Cosmos", src: "/avatars/system-cosmos.svg" },
];

type Copy = { title:string;system:string;custom:string;choose:string;upload:string;saving:string;saved:string;invalid:string;hint:string };

export default function AvatarPicker({locale,userId,name,avatarUrl,verified,onSaved}:{locale:string;userId:string;name:string;avatarUrl:string|null;verified:boolean;onSaved:(url:string)=>void}) {
  const copy:Copy = locale === "zh"
    ? {title:"头像",system:"系统头像",custom:"自定义头像",choose:"选择头像",upload:"上传图片",saving:"保存中…",saved:"头像已更新",invalid:"请选择 JPG、PNG 或 WEBP 图片，且不超过 2MB。",hint:"建议使用正方形图片；头像会自动裁切为圆形。"}
    : locale === "my"
      ? {title:"ပရိုဖိုင်ပုံ",system:"စနစ်ပုံများ",custom:"ကိုယ်ပိုင်ပုံ",choose:"ပုံရွေးရန်",upload:"ပုံတင်ရန်",saving:"သိမ်းနေသည်…",saved:"ပရိုဖိုင်ပုံ ပြောင်းပြီးပါပြီ",invalid:"JPG၊ PNG သို့မဟုတ် WEBP ပုံ (2MB အောက်) ကို ရွေးပါ။",hint:"စတုရန်းပုံကို အကြံပြုသည်။ ပုံကို စက်ဝိုင်းပုံအဖြစ် အလိုအလျောက် ဖြတ်မည်။"}
      : {title:"Avatar",system:"System avatars",custom:"Custom avatar",choose:"Choose avatar",upload:"Upload image",saving:"Saving…",saved:"Avatar updated",invalid:"Choose a JPG, PNG, or WEBP image under 2MB.",hint:"Square images work best; the avatar is cropped into a circle."};
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  async function save(url:string) {
    if (!userId || busy || url===avatarUrl) return;
    setBusy(true); setError(""); setMessage("");
    const {error:saveError}=await supabase.from("profiles").update({avatar_url:url}).eq("id",userId);
    setBusy(false);
    if (saveError) { setError(saveError.message); return; }
    onSaved(url); setMessage(copy.saved);
  }

  async function upload(event:ChangeEvent<HTMLInputElement>) {
    const file=event.target.files?.[0]; event.target.value="";
    if (!file) return;
    if (file.size>2*1024*1024 || !(await validateUpload(file,["image/jpeg","image/png","image/webp"]))) { setError(copy.invalid); return; }
    setBusy(true); setError(""); setMessage("");
    const path=`${userId}/${crypto.randomUUID()}.${safeFileExtension(file)}`;
    const {error:uploadError}=await supabase.storage.from("avatars").upload(path,file,{contentType:file.type,upsert:false});
    if (uploadError) { setBusy(false); setError(uploadError.message); return; }
    const {data}=supabase.storage.from("avatars").getPublicUrl(path);
    await save(data.publicUrl);
    setBusy(false);
  }

  return <section className="avatar-picker" aria-label={copy.title}>
    <div className="avatar-picker-head"><div><h2>{copy.title}</h2><p>{copy.hint}</p></div><VerifiedAvatar name={name} avatarUrl={avatarUrl} verified={verified} size={72}/></div>
    <h3>{copy.system}</h3>
    <div className="avatar-picker-grid">{systemAvatars.map(item=><button key={item.id} type="button" className={avatarUrl===item.src?"is-selected":""} onClick={()=>void save(item.src)} disabled={busy} aria-label={`${copy.choose}: ${item.label}`}><VerifiedAvatar name={item.label} avatarUrl={item.src} size={54}/>{avatarUrl===item.src?<span className="avatar-picker-check"><Check size={13}/></span>:null}</button>)}</div>
    <label className="avatar-upload"><ImagePlus size={18}/><span>{copy.custom}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={busy}/><b>{busy?copy.saving:copy.upload}</b><Upload size={16}/></label>
    {message?<p className="avatar-picker-message" role="status">{message}</p>:null}{error?<p className="avatar-picker-error" role="alert">{error}</p>:null}
  </section>;
}
