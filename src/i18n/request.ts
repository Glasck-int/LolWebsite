import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async () => {
	// Always use default locale to avoid production binding issues
	const locale: string = routing.defaultLocale;
	
	// Skip requestLocale completely in production to avoid bind errors
	// The middleware will handle locale detection instead

	return {
		locale,
		messages: (await import(`../../messages/${locale}.json`)).default,
	};
});
