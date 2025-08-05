import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	// A list of all locales that are supported
	locales: ["en", "fr", "es", "de", "ja", "ko", "zh-cn", "zh-tw", "pt-br", "ru", "tr", "vi", "it", "pl"],

	defaultLocale: "en",
	// Get the user's preferred locale from browser settings
	localeDetection: true,
});

export const locales = ["en", "fr", "es", "de", "ja", "ko", "zh-cn", "zh-tw", "pt-br", "ru", "tr", "vi", "it", "pl"];