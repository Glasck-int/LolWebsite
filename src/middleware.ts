import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
	// Match all pathnames except for
	// - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
	// - … static files with extensions (but allow dots in route parameters)
	matcher: [
		"/((?!api|trpc|_next|_vercel|favicon.ico|robots.txt|sitemap.xml)(?!.*\\.[a-z]{2,4}$).*)",
		"/",
		"/(en|fr|es|de|ja|ko|zh-cn|zh-tw|pt-br|ru|tr|vi|it|pl)/:path*"
	],
};
