import MembershipCheckout from "@/components/knowledge/MembershipCheckout";
import "./membership.css";
export default function MembershipPage({params}:{params:Promise<{locale:string}>}){return <MembershipRoute params={params}/>}
async function MembershipRoute({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <MembershipCheckout locale={locale}/>}
