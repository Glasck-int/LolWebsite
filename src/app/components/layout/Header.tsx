import { getTranslations } from "next-intl/server";
import Image from "next/image";

export const Header = async () => {
  const t = await getTranslations("Homepage" as const);
  return (
    <div className="w-full h-[100px]">
      <div className="flex flex-row justify-between items-center h-full max-w-[1440px] mx-auto px-24 py-4">
        <Image
          src="/assets/SVG/logotypo/glasckWhite.svg"
          alt="logoglasck"
          width={200}
          height={32}
        />
        <h3>{t("Title")}</h3>
      </div>
    </div>
  );
};
