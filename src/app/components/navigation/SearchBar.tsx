"use client";

import { Search } from "lucide-react";

export const SearchBar = () => {

  return (
    <div className="relative">
      <Search className="w-6 h-6 text-white transition-all duration-200 cursor-pointer md:hidden" />
      <div className="w-80 h-10 bg-white/10 backdrop-blur hidden md:flex items-center justify-left rounded-3xl gap-5 px-4 cursor-pointer hover:bg-white/20 transition-all duration-200">
        <Search className="w-6 h-6 text-grey transition-all duration-200 cursor-pointer" />
        <div className="flex items-center bg-transparent text-grey">Search</div>
      </div>
    </div>
  );
};
