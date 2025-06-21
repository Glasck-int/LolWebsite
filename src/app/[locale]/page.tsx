import { getTranslations } from "next-intl/server";
import { Header } from "@/app/components/layout/Header";

export default async function Home() {
  const t = await getTranslations("Homepage" as const);
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
    </div>
  );
}
