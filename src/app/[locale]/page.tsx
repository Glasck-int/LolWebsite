"use client";

import { Header } from "@/app/components/layout/Header";
import { ButtonsHook } from "@/app/components/hooks/ButtonsHook";
import { useState } from "react";

export default function Home() {
  const [selectedButton, setSelectedButton] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <div className="h-[1000px] w-full pt-[80px]">
        <ButtonsHook
          options={["bonjour", "base", "selected", "disabled"]}
          onButtonChange={setSelectedButton}
        />

        <div className="mt-4">
          {selectedButton === "bonjour" && (
            <p>Vous avez sélectionné Bonjour!</p>
          )}
          {selectedButton === "base" && (
            <p>Mode base activé</p>
          )}
          {selectedButton === "selected" && (
            <p>Option selected choisie</p>
          )}
          {selectedButton === "disabled" && (
            <p>Vous avez cliqué sur disabled</p>
          )}
          {!selectedButton && <p>Aucun bouton sélectionné</p>}
        </div>
      </div>
    </div>
  );
}
