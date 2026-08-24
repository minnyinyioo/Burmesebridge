"use client";
import{useParams}from"next/navigation";import TeacherCertificateWorkspace from"@/components/teacher/TeacherCertificateWorkspace";import TeacherAssignmentReview from"@/components/teacher/TeacherAssignmentReview";
export default function TeacherPage(){const locale=String(useParams().locale||"my");return <><TeacherCertificateWorkspace locale={locale}/><div className="teacher-workspace teacher-workspace-secondary"><TeacherAssignmentReview locale={locale}/></div></>}
