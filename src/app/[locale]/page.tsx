import { getTranslations } from "next-intl/server";
import { Header } from "@/app/components/layout/Header";

export default async function Home() {
  const t = await getTranslations("Homepage" as const);
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <h1>Hello</h1>
      <h2>{t("Description")}</h2>
      <h3>{t("Description")}</h3>
      <p>{t("Description")}</p>
      <div className="subtilte">{t("Description")}</div>
    </div>
  );
}
