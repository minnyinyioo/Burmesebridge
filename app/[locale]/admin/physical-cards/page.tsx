"use client";
import{useParams}from"next/navigation";import AdminGuard from"@/components/admin/AdminGuard";import AdminSidebar from"@/components/admin/AdminSidebar";import PhysicalCardRequestManager from"@/components/admin/PhysicalCardRequestManager";
export default function Page(){const locale=String(useParams().locale||"en");return <AdminGuard><div className="adminShell"><AdminSidebar/><main className="adminContent"><PhysicalCardRequestManager locale={locale}/></main></div></AdminGuard>}
