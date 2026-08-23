import type { Metadata } from "next";
import HskAssessment from "@/components/hsk/HskAssessment";

export const metadata: Metadata = { title:"HSK 中文水平测试 | BurmeseBridge", description:"免费 HSK 1–6 中文水平诊断测试，覆盖词汇、语法和阅读。" };

export default async function HskTestPage({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  return <HskAssessment locale={locale}/>;
}
