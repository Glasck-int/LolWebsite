import { Search, Eye, EyeOff } from "lucide-react";
import { BurgerMenu } from "./BurgerMenu";
import { useState } from "react";

export const HeaderActions = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex flex-row gap-6 items-center">
      <Search className="w-6 h-6 text-white transition-all duration-200 cursor-pointer" />
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
