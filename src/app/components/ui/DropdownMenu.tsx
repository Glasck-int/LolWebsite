"use client";

import { ChartNoAxesGantt, PiggyBank } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useTranslate } from "@/lib/hooks/useTranslate";
import {
	DropdownMenuDesktop,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./DropdownMenuDesktop";
import LocaleSwitcher from "../layout/LocaleSwitcher";

interface DropdownMenuProps {
	isMenuOpen: boolean;
	setIsMenuOpen: (isOpen: boolean) => void;
}

/**
 * Dropdown navigation menu component
 *
 * A sliding dropdown menu that appears below the header when the burger menu is activated.
 * Uses the same background image as the main page for visual consistency.
 *
 * @param isMenuOpen - Current state of the dropdown menu visibility
 * @param setIsMenuOpen - Function to toggle the dropdown menu state
 * @returns A JSX element representing the dropdown navigation menu
 *
 * @example
 * ```ts
 * <DropdownMenu
 *   isMenuOpen={true}
 *   setIsMenuOpen={(isOpen) => setMenuState(isOpen)}
 * />
 * ```
 *
 * @remarks
 * The component uses the same background image as the main page and includes
 * a dark overlay for text readability. Navigation items are aligned to the right
 * to match the header layout and automatically close the menu when clicked.
 */
export const DropdownMenu = ({
	isMenuOpen,
	setIsMenuOpen,
}: DropdownMenuProps) => {
	const translate = useTranslate("DropdownMenu");
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;

			{
				/* if the click is outside the menu and the menu is open, close the menu */
			}
			if (!target.closest(".dropdown-menu-container") && isMenuOpen) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, [isMenuOpen, setIsMenuOpen]);

	return (
		<div className="relative dropdown-menu-container">
			{/* Mobile menu - full width */}
			<div
				onClick={() => setIsMenuOpen(false)}
				className={`w-full border-t border-white/10 transition-all duration-100 ease-in relative overflow-hidden md:hidden ${
					isMenuOpen
						? "max-h-[210px] opacity-100"
						: "max-h-0 opacity-0"
				}`}
				style={{
					background:
						'url("/backgroudDesktop.jpg") no-repeat center center fixed',
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundAttachment: "fixed",
				}}
			>
				{/* Overlay for better text readability */}
				<div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

				<div className="relative max-w-[1440px] mx-auto px-4 py-6">
					<nav className="flex flex-col justify-center items-end space-y-4 w-full">
						<Link
							href="/"
							className="text-white hover:text-gray-300 transition-colors duration-200 text-lg font-medium text-right w-full"
							onClick={() => setIsMenuOpen(false)}
						>
							<div className="flex items-center justify-end">
								{translate("Roadmap")}
								<ChartNoAxesGantt className="w-4 h-4 ml-3 text-clear-violet" />
							</div>
						</Link>
						<Link
							href="/about"
							className="text-white hover:text-gray-300 transition-colors duration-200 text-lg font-medium text-right w-full"
							onClick={() => setIsMenuOpen(false)}
						>
							<div className="flex items-center justify-end">
								{translate("Description")}
								<PiggyBank className="w-4 h-4 ml-3 text-yellow" />
							</div>
						</Link>
						<Link
							href="/services"
							className="text-white hover:text-gray-300 transition-colors duration-200 text-lg font-medium text-right w-full"
							onClick={() => setIsMenuOpen(false)}
						>
							{translate("Language")}
						</Link>
						<Link
							href="/contact"
							className="text-white hover:text-gray-300 transition-colors duration-200 text-lg font-medium text-right w-full"
							onClick={() => setIsMenuOpen(false)}
						>
							Contact
						</Link>
					</nav>
				</div>
			</div>

			{/* Desktop/Tablet menu */}
			<div className="hidden md:block">
				<div className="relative max-w-[1440px] mx-auto px-24 ">
					<div className="absolute right-24 hidden md:block">
						<DropdownMenuDesktop open={isMenuOpen} modal={false}>
							<DropdownMenuTrigger asChild>
								<div className="opacity-0 w-0 h-0" />
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="border-white/10 bg-white/10 backdrop-blur-md focus:outline-none text-right hidden md:block min-w-fit"
								align="end"
								alignOffset={0}
								sideOffset={0}
								onClick={() => setIsMenuOpen(false)}
							>
								<DropdownMenuItem
									asChild
									className="text-right hover:bg-white/20"
								>
									<Link
										href="/en"
										className="dropdown-menu-item"
									>
										<div className="flex items-center justify-end">
											{translate("Roadmap")}
											<ChartNoAxesGantt className="w-4 h-4 ml-3 text-clear-violet" />
										</div>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem
									asChild
									className="text-right hover:bg-white/20"
								>
									<Link
										href="/about"
										className="dropdown-menu-item"
									>
										<div className="flex items-center justify-end">
											{translate("Description")}
											<PiggyBank className="w-4 h-4 ml-3 text-yellow" />
										</div>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem className="text-right hover:bg-transparent cursor-default">
									<div className="flex items-center justify-end w-full">
										<LocaleSwitcher />
									</div>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenuDesktop>
					</div>
				</div>
			</div>
		</div>
	);
};
