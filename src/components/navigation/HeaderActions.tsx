"use client";

import { Eye, EyeOff } from "lucide-react";
import { BurgerMenu } from "@/components/ui/BurgerMenu";
import { SearchBar } from "@/components/ui/search/SearchBar";
import LocaleSwitcher from "../layout/LocaleSwitcher/LocaleSwitcher";
import Link from "next/link";
import { useSpoiler } from "@/contexts/SpoilerContext";

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
	const { isSpoilerVisible, toggleSpoiler, isHydrated } = useSpoiler();

	return (
		<div className="flex flex-row gap-6 items-center" data-header-actions>
			<SearchBar />

			{isHydrated && (
				isSpoilerVisible ? (
					<EyeOff
						className="w-6 h-6 text-white transition-all duration-200 cursor-pointer hover:text-gray-300"
						onClick={toggleSpoiler}
					/>
				) : (
					<Eye
						className="w-6 h-6 text-white transition-all duration-200 cursor-pointer hover:text-gray-300"
						onClick={toggleSpoiler}
					/>
				)
			)}
			<LocaleSwitcher className="hidden md:block" />

			<div className="relative">
				<BurgerMenu isOpen={isMenuOpen} setIsOpen={onMenuToggle} />
				
				{/* Desktop dropdown menu positioned relative to burger menu */}
				{isMenuOpen && (
					<div className="hidden md:block absolute top-full right-0 z-50 mt-4">
						<div className="border border-white/10 bg-white/10 backdrop-blur-md rounded-md p-2 min-w-fit shadow-lg">
							<Link
								href="/en"
								className="block text-white hover:bg-white/20 transition-colors p-2 rounded"
								onClick={() => onMenuToggle(false)}
							>
								<div className="flex items-center justify-end">
									Roadmap
									<svg className="w-4 h-4 ml-3 text-clear-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
									</svg>
								</div>
							</Link>
							<Link
								href="/about"
								className="block text-white hover:bg-white/20 transition-colors p-2 rounded"
								onClick={() => onMenuToggle(false)}
							>
								<div className="flex items-center justify-end">
									Nous Soutenir
									<svg className="w-4 h-4 ml-3 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
									</svg>
								</div>
							</Link>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
