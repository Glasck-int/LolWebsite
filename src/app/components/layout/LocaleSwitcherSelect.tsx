"use client";

import { useTranslate } from "@/lib/hooks/useTranslate";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ChangeEvent, ReactNode, useTransition } from "react";

interface LocaleSwitcherSelectProps {
	children: ReactNode;
	defaultValue: string;
	label: string;
}

/**
 * Locale switcher select component
 *
 * A glass-morphism styled select dropdown for changing the application language.
 * Maintains the current route while switching locales.
 *
 * @param children - ReactNode elements to render inside the select
 * @param defaultValue - The currently selected locale value
 * @param label - Accessibility label for the select element
 * @returns A JSX element representing the locale switcher
 *
 * @example
 * ```ts
 * <LocaleSwitcherSelect defaultValue="en" label="Change language">
 *   <option value="en">English</option>
 *   <option value="fr">Français</option>
 * </LocaleSwitcherSelect>
 * ```
 *
 * @remarks
 * Uses the glass-morphism design pattern with backdrop blur and semi-transparent
 * white background. Transitions are handled smoothly with React's useTransition.
 */
export default function LocaleSwitcherSelect({
	children,
	defaultValue,
	label,
}: LocaleSwitcherSelectProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [isPending, startTransition] = useTransition();

	function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
		const nextLocale = event.target.value;
		startTransition(() => {
			router.replace(
				// @ts-ignore
				{ pathname },
				{ locale: nextLocale }
			);
		});
	}

	return (
		<label className="relative">
			<p className="sr-only">{label}</p>
			<select
				className="
					appearance-none 
					bg-white/10 
					backdrop-blur-md 
					border 
					border-white/10 
					rounded-md 
					px-3 
					py-2 
					text-white 
					text-sm 
					font-medium 
					cursor-pointer 
					transition-all 
					duration-200 
					hover:bg-white/20 
					focus:outline-none 
					focus:ring-2 
					focus:ring-white/30 
					focus:border-white/30
					disabled:opacity-50 
					disabled:cursor-not-allowed
					min-w-[80px]
				"
				defaultValue={defaultValue}
				disabled={isPending}
				onChange={onSelectChange}
			>
				{children}
			</select>

			{/* Custom dropdown arrow */}
			<div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
				<svg
					className="w-4 h-4 text-white/70"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</div>
		</label>
	);
}
