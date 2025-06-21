"use client";

import { useState } from "react";

export const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex justify-center items-center md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="transition-all duration-200"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span
            className={`bg-white block transition-all duration-500 ease-in-out h-0.5 w-6 ${
              isOpen ? "rotate-45 translate-y-1 bg-red-400" : "-translate-y-1"
            }`}
          ></span>
          <span
            className={`bg-white block transition-all duration-300 ease-in-out h-0.5 w-6 my-0.5 ${
              isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
            }`}
          ></span>
          <span
            className={`bg-white block transition-all duration-500 ease-in-out h-0.5 w-6 ${
              isOpen ? "-rotate-45 -translate-y-1 bg-red-400" : "translate-y-1"
            }`}
          ></span>
        </div>
      </button>
    </div>
  );
};
