"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronRight, KeyRound, ShieldCheck, ShieldOff } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

type Enrollment = { factorId: string; qrCode: string; secret: string };

export default function AccountSecurityPanel({ locale }: { locale: string }) {
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [mfaOpen, setMfaOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);
  const copy = locale === "zh" ? { title: "账号安全", password: "修改密码", passwordHelp: "定期更新密码，保护你的账号安全。", current: "当前密码", next: "新密码（至少 8 位）", confirm: "确认新密码", change: "更新密码", changed: "密码已更新，请在下次登录时使用新密码。", mismatch: "两次新密码不一致。", failed: "修改失败，请检查当前密码。", twofa: "两步验证（2FA）", enabled: "身份验证器已启用", disabled: "使用身份验证器应用保护账号。", manage: "管理", enable: "启用 2FA", disable: "关闭 2FA", scan: "使用身份验证器应用扫描二维码，然后输入 6 位验证码。", verify: "验证并启用", invalid: "验证码无效。" }
    : locale === "my" ? { title: "အကောင့်လုံခြုံရေး", password: "စကားဝှက်ပြောင်းရန်", passwordHelp: "အကောင့်လုံခြုံရေးအတွက် စကားဝှက်ကို ပုံမှန်ပြောင်းပါ။", current: "လက်ရှိစကားဝှက်", next: "စကားဝှက်အသစ် (အနည်းဆုံး ၈ လုံး)", confirm: "စကားဝှက်အသစ် အတည်ပြုရန်", change: "စကားဝှက်ပြောင်းမည်", changed: "စကားဝှက် ပြောင်းပြီးပါပြီ။", mismatch: "စကားဝှက်အသစ်နှစ်ခု မတူပါ။", failed: "ပြောင်း၍မရပါ။ လက်ရှိစကားဝှက်ကို စစ်ပါ။", twofa: "နှစ်ဆင့်အတည်ပြုခြင်း (2FA)", enabled: "Authenticator ဖွင့်ထားသည်", disabled: "Authenticator app ဖြင့် အကောင့်ကို ကာကွယ်ပါ။", manage: "စီမံရန်", enable: "2FA ဖွင့်မည်", disable: "2FA ပိတ်မည်", scan: "Authenticator app ဖြင့် QR ကို scan လုပ်ပြီး ဂဏန်း ၆ လုံးထည့်ပါ။", verify: "အတည်ပြုပြီး ဖွင့်မည်", invalid: "Code မမှန်ပါ။" }
    : { title: "Account security", password: "Change password", passwordHelp: "Update your password regularly to keep your account secure.", current: "Current password", next: "New password (at least 8 characters)", confirm: "Confirm new password", change: "Update password", changed: "Password updated. Use the new password next time you sign in.", mismatch: "The new passwords do not match.", failed: "Password change failed. Check your current password.", twofa: "Two-factor authentication (2FA)", enabled: "Authenticator enabled", disabled: "Protect your account with an authenticator app.", manage: "Manage", enable: "Enable 2FA", disable: "Disable 2FA", scan: "Scan the QR code with an authenticator app, then enter the 6-digit code.", verify: "Verify and enable", invalid: "The verification code is invalid." };

  const loadFactors = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setMfaFactorId(data?.totp.find((factor) => factor.status === "verified")?.id || "");
  }, []);
  useEffect(() => {
    // Load the remote factor state after the authenticated client is available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFactors();
  }, [loadFactors]);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    if (passwords.next.length < 8 || passwords.next !== passwords.confirm) { setMessage(copy.mismatch); return; }
    setPasswordBusy(true);
    const { data } = await supabase.auth.getSession();
    const response = await fetch("/api/account/password", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token || ""}` }, body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.next }) });
    setPasswordBusy(false);
    if (!response.ok) { setMessage(copy.failed); return; }
    setPasswords({ current: "", next: "", confirm: "" }); setMessage(copy.changed); setPasswordOpen(false);
  }

  async function startEnrollment() {
    setMfaBusy(true); setMessage("");
    const { data: factors } = await supabase.auth.mfa.listFactors();
    for (const factor of factors?.all.filter((item) => item.factor_type === "totp" && item.status === "unverified") || []) await supabase.auth.mfa.unenroll({ factorId: factor.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "BurmeseBridge" });
    setMfaBusy(false);
    if (error || !data?.totp) { setMessage(error?.message || copy.failed); return; }
    const qrCode = data.totp.qr_code.startsWith("data:") ? data.totp.qr_code : `data:image/svg+xml;utf-8,${encodeURIComponent(data.totp.qr_code)}`;
    setEnrollment({ factorId: data.id, qrCode, secret: data.totp.secret });
  }

  async function verifyEnrollment() {
    if (!enrollment || !/^\d{6}$/.test(mfaCode)) { setMessage(copy.invalid); return; }
    setMfaBusy(true); setMessage("");
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enrollment.factorId, code: mfaCode });
    setMfaBusy(false);
    if (error) { setMessage(copy.invalid); return; }
    setEnrollment(null); setMfaCode(""); setMfaOpen(false); await loadFactors();
  }

  async function disableMfa() {
    if (!mfaFactorId || !window.confirm(copy.disable + "?")) return;
    setMfaBusy(true); const { error } = await supabase.auth.mfa.unenroll({ factorId: mfaFactorId }); setMfaBusy(false);
    if (error) { setMessage(error.message); return; } setMfaFactorId(""); setMfaOpen(false);
  }

  const setPassword = (field: keyof typeof passwords, value: string) => setPasswords((current) => ({ ...current, [field]: value }));
  return <section className="account-security"><h2><ShieldCheck size={20} />{copy.title}</h2>
    <div className="settings-list">
      <button type="button" className="settings-row" onClick={() => { setMessage(""); setPasswordOpen(true); }}><span className="settings-row-icon"><KeyRound size={19} /></span><span className="settings-row-copy"><strong>{copy.password}</strong><small>{copy.passwordHelp}</small></span><ChevronRight size={20} /></button>
      <button type="button" className="settings-row" onClick={() => { setMessage(""); setMfaOpen(true); }}><span className="settings-row-icon">{mfaFactorId ? <ShieldCheck size={19} /> : <ShieldOff size={19} />}</span><span className="settings-row-copy"><strong>{copy.twofa}</strong><small>{mfaFactorId ? copy.enabled : copy.disabled}</small></span><span className="settings-row-action">{copy.manage}</span><ChevronRight size={20} /></button>
    </div>{message ? <p className="security-message" role="status">{message}</p> : null}
    <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}><DialogContent className="account-dialog"><DialogHeader><DialogTitle>{copy.password}</DialogTitle><DialogDescription>{copy.passwordHelp}</DialogDescription></DialogHeader><form onSubmit={changePassword} className="security-form">
      <input type="password" autoComplete="current-password" placeholder={copy.current} aria-label={copy.current} value={passwords.current} onChange={(event) => setPassword("current", event.target.value)} required />
      <input type="password" autoComplete="new-password" placeholder={copy.next} aria-label={copy.next} value={passwords.next} onChange={(event) => setPassword("next", event.target.value)} minLength={8} required />
      <input type="password" autoComplete="new-password" placeholder={copy.confirm} aria-label={copy.confirm} value={passwords.confirm} onChange={(event) => setPassword("confirm", event.target.value)} minLength={8} required />
      {message ? <p className="auth-error" role="alert">{message}</p> : null}<button type="submit" disabled={passwordBusy}>{passwordBusy ? "…" : copy.change}</button></form></DialogContent></Dialog>
    <Dialog open={mfaOpen} onOpenChange={(open) => { setMfaOpen(open); if (!open && enrollment) { setEnrollment(null); setMfaCode(""); } }}><DialogContent className="account-dialog"><DialogHeader><DialogTitle>{copy.twofa}</DialogTitle><DialogDescription>{mfaFactorId ? copy.enabled : copy.disabled}</DialogDescription></DialogHeader>
      {enrollment ? <div className="mfa-enrollment"><p>{copy.scan}</p><Image unoptimized src={enrollment.qrCode} alt="2FA QR code" width={180} height={180} /><code>{enrollment.secret}</code><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={mfaCode} onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, ""))} placeholder="123456" aria-label="2FA code" /><button type="button" onClick={verifyEnrollment} disabled={mfaBusy}>{copy.verify}</button></div>
        : <button className="dialog-primary-action" type="button" onClick={mfaFactorId ? disableMfa : startEnrollment} disabled={mfaBusy}>{mfaFactorId ? copy.disable : copy.enable}</button>}
    </DialogContent></Dialog>
  </section>;
}
