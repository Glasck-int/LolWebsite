"use client";

import { Search, Eye, EyeOff } from "lucide-react";
import { BurgerMenu } from "./BurgerMenu";
import { useState } from "react";
import { SearchBar } from "./SearchBar";

// TYEs

export const HeaderActions = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex flex-row gap-6 items-center">
      <SearchBar />

      {isVisible ? (
        <EyeOff
          className="w-6 h-6 text-white transition-all duration-200 cursor-pointer"
          onClick={() => {
            setIsVisible(!isVisible);
          }}
        />
      ) : (
        <Eye
          className="w-6 h-6 text-white transition-all duration-200 cursor-pointer"
          onClick={() => {
            setIsVisible(!isVisible);
          }}
        />
      )}
      <BurgerMenu />
    </div>
  );
};
