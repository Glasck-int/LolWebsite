"use client";

interface BurgerMenuProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

/**
 * Animated burger menu toggle button
 *
 * A hamburger menu component that transforms into an X when clicked.
 * Provides smooth CSS animations between open and closed states and communicates
 * state changes to parent components.
 *
 * @param isOpen - Current state of the menu (open/closed)
 * @param onBurgerMenuClick - Callback function triggered when menu is toggled
 * @returns A JSX element representing the animated burger menu button
 *
 * @example
 * ```ts
 * <BurgerMenu isOpen={isOpen} onBurgerMenuClick={(isOpen) => handleMenuToggle(isOpen)} />
 * ```
 *
 * @remarks
 * The component uses the provided isOpen state to control its appearance.
 * When closed, it displays three horizontal white lines.
 * When opened, the lines transform into an X shape.
 * The animation uses CSS transforms and transitions for smooth visual feedback.
 *
 * @see Header - Component that typically contains the burger menu for mobile navigation
 */

export const BurgerMenu = ({ isOpen, setIsOpen }: BurgerMenuProps) => {
	const handleClick = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div className="flex justify-center items-center">
			<button
				onClick={handleClick}
				className="transition-all duration-200"
			>
				<div className="w-6 h-6 flex flex-col justify-center items-center">
					<span
						className={`bg-white block transition-all duration-500 ease-in-out h-0.5 w-6 ${
							isOpen
								? "rotate-45 translate-y-1 bg-red-400"
								: "-translate-y-1"
						}`}
					></span>
					<span
						className={`bg-white block transition-all duration-300 ease-in-out h-0.5 w-6 my-0.5 ${
							isOpen
								? "opacity-0 scale-0"
								: "opacity-100 scale-100"
						}`}
					></span>
					<span
						className={`bg-white block transition-all duration-500 ease-in-out h-0.5 w-6 ${
							isOpen
								? "-rotate-45 -translate-y-1 bg-red-400"
								: "translate-y-1"
						}`}
					></span>
				</div>
			</button>
		</div>
	);
};
