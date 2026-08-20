import { permanentRedirect } from "next/navigation";

export default async function LegacyLearnPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  permanentRedirect(`/${locale}/videos`);
}
