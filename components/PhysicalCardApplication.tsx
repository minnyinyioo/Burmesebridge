"use client";

import Link from "next/link";
import { ArrowRight, Wifi as Contactless } from "lucide-react";

type Card = { id: number };

export default function PhysicalCardApplication({ locale, cards }: { locale: string; cards: Card[] }) {
  const copy = locale === "zh"
    ? { title: "申请实体 NFC 学生证 / 教师证", body: "请前往独立申请页面选择国家或地区，并填写完整收件资料。", action: "前往实体卡申请", unavailable: "签发有效电子证件后才能申请实体卡。" }
    : locale === "my"
      ? { title: "NFC ကျောင်းသား/ဆရာကတ် လျှောက်ထားရန်", body: "နိုင်ငံ/ဒေသနှင့် လက်ခံမည့်လိပ်စာကို သီးခြားစာမျက်နှာတွင် ပြည့်စုံစွာ ဖြည့်ပါ။", action: "ကတ်လျှောက်လွှာသို့ သွားရန်", unavailable: "အသက်ဝင်သော ဒစ်ဂျစ်တယ်ကတ် ထုတ်ပေးပြီးမှ လျှောက်ထားနိုင်သည်။" }
      : { title: "Apply for a physical NFC student / teacher ID", body: "Use the dedicated application page to select a country or region and provide complete delivery details.", action: "Open physical card application", unavailable: "An active digital ID must be issued before you can apply." };

  return <section className="physical-card-application physical-card-entry">
    <header><span><Contactless size={25} /></span><div><h2>{copy.title}</h2><p>{cards.length ? copy.body : copy.unavailable}</p></div></header>
    {cards.length ? <Link className="physical-card-entry-link" href={`/${locale}/physical-card`}>{copy.action}<ArrowRight size={17} /></Link> : null}
  </section>;
}
