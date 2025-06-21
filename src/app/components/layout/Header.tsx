"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { HeaderActions } from "../navigation/HeaderActions";

export const Header = () => {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY;
			setIsScrolled(scrollTop > 50); // Change après 50px de scroll
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div
			className={`w-full h-[80px] fixed top-0 left-0 z-50 transition-all duration-300 ${
				isScrolled ? "bg-black/30 backdrop-blur-3xl" : "bg-transparent"
			}`}
		>
			<div className="flex flex-row justify-between items-center h-full max-w-[1440px] mx-auto px-4 md:px-24 py-4">
				<Image
					src="/assets/SVG/logotypo/glasckWhite.svg"
					alt="logoglasck"
					width={170}
					height={28}
				/>
				<HeaderActions />
			</div>
		</div>
	);
};
