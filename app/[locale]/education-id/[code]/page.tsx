import { redirect } from "next/navigation";

export default async function EducationIdCodeRedirect({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  redirect(`/${locale || "my"}/certificate/${encodeURIComponent(code || "")}`);
}
