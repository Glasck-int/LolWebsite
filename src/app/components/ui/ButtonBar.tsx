"use client";

import { Button } from "@/app/components/ui/Button";
import { useState } from "react";

export const ButtonBar = (props: {
	options: string[];
	onButtonChange: (option: string | null) => void;
}) => {
	const [activeButton, setActiveButton] = useState<string | null>(null);
	const options = props.options;

	/**
	 * @description Handle the button click
	 * @param {string} option - The option to display in the buttons
	 */
	const handleButtonClick = (option: string) => {
		const newValue = activeButton === option ? null : option;
		setActiveButton(newValue);
		props.onButtonChange(newValue);
	};
	return (
		<div className="flex flex-row gap-2">
			{options.map((option) => (
				<Button
					key={option}
					variant={activeButton === option ? "selected" : "base"}
					onClick={() => setActiveButton(option)}
				>
					{option}
				</Button>
			))}
		</div>
	);
};
