import { redirect } from "next/navigation";

export default async function EducationIdLookupRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale || "my"}/certificate`);
}
