"use client";

import { Search, Eye, EyeOff } from "lucide-react";
import { BurgerMenu } from "@/app/components/ui/BurgerMenu";
import { useState } from "react";
import { SearchBar } from "@/app/components/ui/SearchBar";
import LocaleSwitcher from "../layout/LocaleSwitcher";

interface HeaderActionsProps {
	isMenuOpen: boolean;
	onMenuToggle: (isOpen: boolean) => void;
}

/**
 * Header navigation actions component
 *
 * Contains the search bar, visibility toggle, and burger menu controls.
 * Manages the state coordination between different header actions.
 *
 * @param isMenuOpen - Current state of the dropdown menu
 * @param onMenuToggle - Callback function to toggle the dropdown menu state
 * @returns A JSX element with header action buttons
 *
 * @example
 * ```ts
 * <HeaderActions
 *   isMenuOpen={false}
 *   onMenuToggle={(isOpen) => setMenuOpen(isOpen)}
 * />
 * ```
 *
 * @remarks
 * This component acts as a bridge between the header and its interactive elements.
 * It coordinates the visibility state and menu state to ensure proper UI behavior.
 */
export const HeaderActions = ({
	isMenuOpen,
	onMenuToggle,
}: HeaderActionsProps) => {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<div className="flex flex-row gap-6 items-center" data-header-actions>
			<SearchBar />

			{isVisible ? (
				<EyeOff
					className="w-6 h-6 text-white transition-all duration-200 cursor-pointer hover:text-gray-300"
					onClick={() => setIsVisible(!isVisible)}
				/>
			) : (
				<Eye
					className="w-6 h-6 text-white transition-all duration-200 cursor-pointer hover:text-gray-300"
					onClick={() => setIsVisible(!isVisible)}
				/>
			)}
			<LocaleSwitcher />

			<BurgerMenu isOpen={isMenuOpen} setIsOpen={onMenuToggle} />
		</div>
	);
};
