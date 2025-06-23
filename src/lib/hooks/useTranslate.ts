/**
 * Custom translation hook
 *
 * A wrapper around next-intl's useTranslations hook that provides type-safe translations
 * and can be safely used with "use client" directive.
 *
 * @param namespace - The translation namespace to use (e.g., "SearchBar", "Homepage")
 * @returns A function that accepts a translation key and returns the translated string
 *
 * @example
 * ```ts
 * const translate = useTranslate("SearchBar");
 * const searchText = translate("Title"); // Returns "Search" or "Rechercher" based on locale
 * ```
 *
 * @remarks
 * This hook is designed to work with the next-intl translation system while being
 * safe to use in client components. It provides a simpler interface compared to
 * the raw useTranslations hook.
 */

"use client";

import { useTranslations } from "next-intl";

export const useTranslate = (namespace: string) => {
	const t = useTranslations(namespace);

	return (key: string) => {
		try {
			return t(key);
		} catch (error) {
			console.error(`Translation error for ${namespace}.${key}:`, error);
			return key;
		}
	};
};
