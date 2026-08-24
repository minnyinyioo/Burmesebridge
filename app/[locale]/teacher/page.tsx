"use client";
import{useParams}from"next/navigation";import TeacherCertificateWorkspace from"@/components/teacher/TeacherCertificateWorkspace";
export default function TeacherPage(){const locale=String(useParams().locale||"my");return <TeacherCertificateWorkspace locale={locale}/>}
