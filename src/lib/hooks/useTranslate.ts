/**
 * Custom translation hook
 *
 * A wrapper around next-intl's useTranslations hook that provides type-safe translations
 * and can be safely used with "use client" directive. Supports ICU MessageFormat parameters
 * and automatic text truncation.
 *
 * @param namespace - The translation namespace to use (e.g., "SearchBar", "Homepage")
 * @returns A function that accepts a translation key, optional parameters, and max length
 *
 * @example
 * ```ts
 * const translate = useTranslate("SearchBar");
 * const searchText = translate("Title"); // Returns "Search" or "Rechercher" based on locale
 *
 * // ICU MessageFormat with parameters
 * const localeText = translate("locale", { locale: "en" }); // Returns "🇺🇸 En"
 *
 * // With truncation
 * const shortText = translate("Title", {}, 8); // Returns "Recherc..." if French
 * ```
 *
 * @remarks
 * This hook is designed to work with the next-intl translation system while being
 * safe to use in client components. It supports both simple translations and
 * ICU MessageFormat with parameters for conditional translations. The truncation
 * feature helps maintain consistent UI layouts by limiting text length.
 */

"use client";

import { useTranslations } from "next-intl";
import { truncateText } from "../utils";

export const useTranslate = (namespace: string) => {
	const t = useTranslations(namespace);
	return (
		key: string,
		options?: {
			params?: Record<string, string | number | Date>;
			maxLength?: number;
		}
	) => {
		try {
			const translation = t(key, options?.params);

			// Apply truncation if maxLength is specified
			if (options?.maxLength && translation.length > options.maxLength) {
				return truncateText(translation, options.maxLength);
			}

			return translation;
		} catch (error) {
			console.error(`Translation error for ${namespace}.${key}:`, error);
			return key;
		}
	};
};
