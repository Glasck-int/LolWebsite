import "./globals.css";

import { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header/Header";
import { SpoilerProvider } from "@/contexts/SpoilerContext";

const inter = Inter({
	subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: 'Glasck.com',
        template: '%s - Glasck.com',
    },
    description:
        'Glasck.com is a website that provides information about League of Legends Esport scene.',
    icons: {
        icon: '/favicon.ico',
    },
    manifest: '/manifest.json',
    openGraph: {
        type: 'website',
        title: 'Glasck.com',
        description:
            'Glasck.com is a website that provides information about League of Legends Esport scene.',
        images: ['/favicon.ico'],
        siteName: 'Glasck.com',
    },
    twitter: {
        card: 'summary_large_image',
        site: '@glasck',
        creator: '@glasck',
    },
    metadataBase: new URL('https://glasck.com'),
    alternates: {
        canonical: 'https://glasck.com',
        languages: {
            'en-US': 'https://glasck.com/en',
            'fr-FR': 'https://glasck.com/fr',
        },
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
}

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
	} catch (error) {
		console.error(error);
		notFound();
	}

	return (
		<html lang={locale}>
			<body className={inter.className}>
				<NextIntlClientProvider locale={locale} messages={messages}>
					<SpoilerProvider>
						<Header />
                    <div className="pt-24 px-4 body-container">
						{children}
					</div>
					</SpoilerProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
