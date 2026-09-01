"use client";
import{useParams}from"next/navigation";import PhysicalCardApplicationForm from"@/components/PhysicalCardApplicationForm";
export default function PhysicalCardPage(){const locale=String(useParams().locale||"en");return <PhysicalCardApplicationForm locale={locale}/>}
