"use client";

import { Button } from "@/app/components/ui/Button";
import { useState } from "react";

/**
 * ButtonBar component properties
 *
 * Interface defining the props required for the ButtonBar component.
 *
 * @param options - Array of button labels to display in the bar
 * @param onButtonChange - Callback function called when a button selection changes
 */
interface ButtonBarProps {
	options: string[];
	onButtonChange: (option: string | null) => void;
}

/**
 * Single selection button bar
 *
 * Component that displays a series of buttons where only one can be selected at a time.
 * Clicking on the active button deselects it.
 *
 * @param props - The component properties containing the options and callback
 * @returns A JSX element representing the button bar
 *
 * @example
 * ```ts
 * const handleButtonChange = (option: string | null) => {
 *   console.log('Selected button:', option);
 * };
 *
 * <ButtonBar
 *   options={['Option 1', 'Option 2', 'Option 3']}
 *   onButtonChange={handleButtonChange}
 * />
 * ```
 *
 * @remarks
 * The component maintains internal state for the active button. Only one button can be
 * selected at a time. Clicking on the already selected button deselects it and
 * passes the null value to the callback.
 *
 * @see Button - Component used for each individual button
 */
export const ButtonBar = (props: ButtonBarProps) => {
	const [activeButtonIndex, setActiveButtonIndex] = useState<number | null>(
		null
	);
	const options = props.options;

	const handleButtonClick = (option: string, index: number) => {
		const newActiveIndex = activeButtonIndex === index ? null : index;
		const newValue = newActiveIndex !== null ? option : null;
		setActiveButtonIndex(newActiveIndex);
		props.onButtonChange(newValue);
	};
	return (
		<div className="flex flex-row gap-2">
			{options.map((option, index) => (
				<Button
					key={index}
					variant={activeButtonIndex === index ? "selected" : "base"}
					onClick={() => handleButtonClick(option, index)}
				>
					{option}
				</Button>
			))}
		</div>
	);
};
