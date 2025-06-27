"use client";

import { useLocale } from "next-intl";
import LocaleSwitcherSelect from "./LocaleSwitcherSelect";
import { locales } from "@/i18n/routing";
import { useTranslate } from "@/lib/hooks/useTranslate";

/**
 * Locale switcher component
 *
 * A complete locale switching component that displays available languages
 * with proper labels and handles locale transitions.
 *
 * @returns A JSX element representing the complete locale switcher
 *
 * @example
 * ```ts
 * <LocaleSwitcher />
 * ```
 *
 * @remarks
 * Automatically detects the current locale and provides options for
 * English and French. Uses the glass-morphism design pattern.
 */
export default function LocaleSwitcher() {
	const t = useTranslate("LocaleSwitcher");
	const locale = useLocale();

	return (
		<LocaleSwitcherSelect
			defaultValue={locale}
			label={t("label")}
			showOnMobile
		>
			{locales.map((currentLocale) => (
				<option key={currentLocale} value={currentLocale}>
					{t("locale", { params: { locale: currentLocale } })}
				</option>
			))}
		</LocaleSwitcherSelect>
	);
}
