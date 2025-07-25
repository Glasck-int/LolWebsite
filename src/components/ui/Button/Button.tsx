import React from "react";

/**
 * Button component properties
 *
 * Interface defining the props required for the Button component.
 *
 * @param children - The content to be displayed inside the button
 * @param variant - The visual style variant of the button, either "base" or "selected"
 * @param onClick - Optional callback function called when the button is clicked
 * @param disabled - Whether the button should be disabled and non-interactive
 * @param className - Additional CSS classes to apply to the button
 * @param type - The HTML button type attribute
 */
interface ButtonProps {
	children: React.ReactNode;
	variant?: "base" | "selected";
	onClick?: () => void;
	disabled?: boolean;
	className?: string;
	type?: "button" | "submit" | "reset";
}

/**
 * Customizable button component
 *
 * A flexible button component with multiple variants and styling options.
 * Supports different visual states and can be used in various contexts.
 *
 * @param props - The button properties including content, styling, and behavior options
 * @returns A styled button element with the specified properties
 *
 * @example
 * ```ts
 * // Basic button
 * <Button onClick={() => console.log('Clicked!')}>
 *   Click me
 * </Button>
 *
 * // Selected variant button
 * <Button variant="selected" disabled={true}>
 *   Selected Button
 * </Button>
 * ```
 *
 * @remarks
 * The component supports two main variants: "base" for default styling and "selected"
 * for highlighted state. The button automatically handles disabled states with
 * appropriate visual feedback and cursor changes. Custom classes can be added
 * via the className prop for additional styling.
 *
 * @see ButtonBar - Component that uses multiple Button instances for selection
 */
export const Button = ({
	children,
	variant = "base",
	onClick,
	disabled = false,
	className = "",
	type = "button",
}: ButtonProps) => {
	const baseClasses = `
    h-10
    px-2
    rounded-2xl 
    border 
    border-solid
    font-inter 
    font-semlibod 
    text-xl 
    md:text-2xl 
    tracking-normal
    transition-all 
    duration-200 
    cursor-pointer
    disabled:cursor-not-allowed
    disabled:opacity-50
  `;

	const variantClasses = {
		base: `
      bg-white-06 
      border-dark-grey 
      text-clear-grey
      hover:bg-white-10
	  backdrop-blur-md
    `,
		selected: `
      bg-white 
      border-dark-grey 
      text-black
      hover:bg-white/90
    `,
	};

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={`${baseClasses} ${variantClasses[variant]} ${className}`}
		>
			{children}
		</button>
	);
};