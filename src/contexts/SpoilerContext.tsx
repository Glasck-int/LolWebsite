"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface SpoilerContextType {
  isSpoilerVisible: boolean;
  toggleSpoiler: () => void;
  isHydrated: boolean;
}

const SpoilerContext = createContext<SpoilerContextType | undefined>(undefined);

interface SpoilerProviderProps {
  children: ReactNode;
}

export const SpoilerProvider = ({ children }: SpoilerProviderProps) => {
  const [isSpoilerVisible, setIsSpoilerVisible] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load the state from localStorage on mount
  useEffect(() => {
    const savedSpoilerState = localStorage.getItem('spoilerVisible');
    if (savedSpoilerState !== null) {
      setIsSpoilerVisible(JSON.parse(savedSpoilerState));
    }
    setIsHydrated(true);
  }, []);

  const toggleSpoiler = () => {
    const newState = !isSpoilerVisible;
    setIsSpoilerVisible(newState);
    // Save to localStorage
    localStorage.setItem('spoilerVisible', JSON.stringify(newState));
  };

  return (
    <SpoilerContext.Provider value={{ isSpoilerVisible, toggleSpoiler, isHydrated }}>
      {children}
    </SpoilerContext.Provider>
  );
};

export const useSpoiler = () => {
  const context = useContext(SpoilerContext);
  if (context === undefined) {
    throw new Error("useSpoiler must be used within a SpoilerProvider");
  }
  return context;
};