"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DeleteAccountPanel({ locale, email }: { locale: string; email: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const copy = locale === "zh" ? {
    title: "删除账号", body: "永久删除账号、个人资料及相关个人数据。此操作无法撤销。", button: "永久删除账号",
    prompt: `请输入 DELETE ${email} 以确认`, confirm: "此操作无法撤销。", mismatch: "确认文字不匹配，账号没有被删除。", failed: "删除失败，请稍后重试或联系管理员。",
  } : locale === "my" ? {
    title: "အကောင့်ဖျက်ရန်", body: "အကောင့်နှင့် ဆက်စပ်ကိုယ်ရေးဒေတာကို အပြီးဖျက်မည်။ ပြန်ယူ၍မရပါ။", button: "အကောင့်ကို အပြီးဖျက်မည်",
    prompt: `အတည်ပြုရန် ဤစာကို ရိုက်ပါ:\nDELETE ${email}`, confirm: "နောက်ဆုံးအတည်ပြုချက် — အကောင့်ကို အပြီးဖျက်မည်လား?", mismatch: "အတည်ပြုစာ မကိုက်ညီပါ။", failed: "ဖျက်၍မရပါ။ နောက်မှ ထပ်စမ်းပါ။",
  } : {
    title: "Delete account", body: "Permanently delete your account, profile, and associated personal data. This cannot be undone.", button: "Permanently delete account",
    prompt: `Type the following to confirm:\nDELETE ${email}`, confirm: "Final confirmation: permanently delete this account?", mismatch: "The confirmation did not match. Nothing was deleted.", failed: "Deletion failed. Try again later or contact an administrator.",
  };

  async function removeAccount() {
    const expected = `DELETE ${email}`;
    const typed = confirmation;
    if (typed !== expected) { setError(copy.mismatch); return; }
    setBusy(true); setError("");
    const { data } = await supabase.auth.getSession();
    const response = await fetch("/api/account", {
      method: "DELETE",
      headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token || ""}` },
      body: JSON.stringify({ confirmation: typed }),
    });
    if (!response.ok) { setBusy(false); setError(copy.failed); return; }
    await supabase.auth.signOut();
    window.location.replace(`/${locale}`);
  }

  return <section className="account-danger-zone"><div><h2>{copy.title}</h2><p>{copy.body}</p></div>
    <button type="button" onClick={() => { setError(""); setOpen(true); }} disabled={busy}><Trash2 size={17} />{copy.button}</button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="account-dialog danger-dialog"><DialogHeader><DialogTitle>{copy.title}</DialogTitle><DialogDescription>{copy.body} {copy.confirm}</DialogDescription></DialogHeader>
      <label className="confirmation-field"><span>{copy.prompt}</span><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" /></label>
      {error ? <p className="auth-error" role="alert">{error}</p> : null}<button className="danger-confirm" type="button" onClick={removeAccount} disabled={busy || confirmation !== `DELETE ${email}`}><Trash2 size={17} />{busy ? "…" : copy.button}</button>
    </DialogContent></Dialog>
  </section>;
}
