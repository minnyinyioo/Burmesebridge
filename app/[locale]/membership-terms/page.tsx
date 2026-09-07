import Link from "next/link";
import "../membership/membership.css";
import { membershipTerms, membershipTermsVersion } from "@/lib/membershipTerms";
export default async function MembershipTermsPage({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params;
 return <main className="membership-page"><h1>{locale==="zh"?"会员服务条款":locale==="my"?"အဖွဲ့ဝင်စည်းမျဉ်း":"Membership terms"}</h1><small>{membershipTermsVersion}</small>{membershipTerms(locale).map((term,i)=><p key={term}>{i+1}. {term}</p>)}<Link href={"/"+locale+"/membership"}>{locale==="zh"?"返回会员中心":"Membership"}</Link></main>;
}
