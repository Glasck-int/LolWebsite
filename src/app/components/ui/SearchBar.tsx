"use client";

import { Search } from "lucide-react";
import { useTranslate } from "@/lib/hooks/useTranslate";

/**
 * Responsive search bar component
 *
 * A search bar component that adapts its appearance based on screen size.
 * Shows a simple search icon on mobile and a full search bar on desktop.
 *
 * @returns A JSX element representing the responsive search bar
 *
 * @example
 * ```ts
 * // Basic usage
 * <SearchBar />
 * ```
 *
 * @remarks
 * The component uses responsive design principles: on mobile devices (md:hidden),
 * only a search icon is displayed. On desktop and larger screens, a full search bar
 * with background blur effect and hover states is shown. The search functionality
 * is currently visual only and would need to be implemented separately.
 *
 * @see Button - Related UI component for interactive elements
 */
export const SearchBar = () => {
	const translate = useTranslate("SearchBar");

	return (
		<div className="relative">
			<Search className="w-6 h-6 text-white transition-all duration-200 cursor-pointer md:hidden" />
			<div className="md:w-40 lg:w-64 xl:w-80 h-9 bg-white/10 backdrop-blur hidden md:flex items-center justify-left rounded-3xl gap-5 px-4 cursor-pointer hover:bg-white/20 transition-all duration-200">
				<Search className="w-6 h-6 text-grey transition-all duration-200 cursor-pointer" />
				<div className="flex items-center bg-transparent text-grey">
					{/* Responsive text truncation - un seul span visible à la fois */}
					<span className="md:block lg:hidden">
						{translate("Title", { maxLength: 8 })}
					</span>
					<span className="hidden lg:block xl:hidden">
						{translate("Title", { maxLength: 10 })}
					</span>
					<span className="hidden xl:block">
						{translate("Title")}
					</span>
				</div>
			</div>
		</div>
	);
};
