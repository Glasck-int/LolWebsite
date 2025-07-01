import React from "react";
import Link from "next/link";

interface FooterItemProps {
	children: React.ReactNode;
	href?: string;
}

/**
 * Footer component with two icons centered in the left and right halves of the footer
 *
 * Places the Trophy icon at the center of the left half and the Swords icon at the center
 * of the right half of the footer bar. Only visible on mobile devices.
 *
 * @returns A JSX element representing the styled footer with two icons
 *
 * @example
 * ```ts
 * <Footer>
 *   <Trophy className="w-6 h-6 text-white" />
 *   <Swords className="w-6 h-6 text-white" />
 * </Footer>
 * ```
 *
 * @remarks
 * Uses absolute positioning and translation to center each icon in its respective half.
 */
const FooterMobile = ({ children }: FooterItemProps) => (
	<footer className="fixed bottom-0 left-0 w-full h-[70px] bg-white/10 backdrop-blur-3xl block md:hidden">
		<div className="flex items-center justify-between h-full w-full body-container">
			{children}
		</div>
	</footer>
);

/**
 * Footer item component
 *
 * Represents a single item in the footer, which can contain icons, text, or any custom content.
 *
 * @param children - Content to display inside the item (icon, text, etc.)
 * @param href - Optional link for the item
 * @returns The footer item JSX element
 */
const FooterItem = ({ children, href }: FooterItemProps) => {
	const content = (
		<div className="flex flex-col items-center justify-center w-full h-full">
			{children}
		</div>
	);

	if (href) {
		return (
			<Link
				href={href}
				className="flex-1 flex justify-center items-center h-full"
			>
				{content}
			</Link>
		);
	}

	return (
		<div className="flex-1 flex justify-center items-center h-full">
			{content}
		</div>
	);
};

export { FooterMobile, FooterItem };
