import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
	// Handle cases where requestLocale might be undefined
	let locale: string = routing.defaultLocale;
	
	try {
		if (requestLocale) {
			const requested = await requestLocale;
			// Check if the requested locale is supported
			if (requested && routing.locales.includes(requested as typeof routing.locales[number])) {
				locale = requested as string;
			}
		}
	} catch (error) {
		// Fallback to default locale if there's an error
		console.warn('Error getting request locale, using default:', error);
	}

	return {
		locale,
		messages: (await import(`../../messages/${locale}.json`)).default,
	};
});
