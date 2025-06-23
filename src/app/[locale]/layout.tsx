import "./globals.css";

import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Inter } from "next/font/google";
import { Header } from "@/app/components/layout/Header";

const inter = Inter({
	subsets: ["latin"],
});

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	let messages;
	try {
		messages = (await import(`../../../messages/${locale}.json`)).default;
		console.log(messages);
	} catch (error) {
		notFound();
	}

	return (
		<html lang={locale}>
			<body className={inter.className}>
				<NextIntlClientProvider locale={locale} messages={messages}>
					<Header />
					{children}
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
