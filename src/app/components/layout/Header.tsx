"use client";

import Image from "next/image";
import { HeaderActions } from "../navigation/HeaderActions";

export const Header = () => {
  return (
    <div className="w-full h-[80px]">
      <div className="flex flex-row justify-between items-center h-full max-w-[1440px] mx-auto px-4 md:px-24 py-4">
        <Image
          src="/assets/SVG/logotypo/glasckWhite.svg"
          alt="logoglasck"
          width={170}
          height={28}
        />
        <HeaderActions />
      </div>
    </div>
  );
};


