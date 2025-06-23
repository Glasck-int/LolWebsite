import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	// A list of all locales that are supported
	locales: ["en", "fr"],
	
	defaultLocale: "en",
	// Get the user's preferred locale from browser settings
	localeDetection: true,
});
