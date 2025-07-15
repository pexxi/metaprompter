import type React from "react";

interface CardProps {
	children: React.ReactNode;
	className?: string;
	padding?: "none" | "sm" | "md" | "lg";
}

const Card: React.FC<CardProps> = ({
	children,
	className = "",
	padding = "md",
}) => {
	const hasBackgroundColor = className.includes("bg-");
	const baseClasses = `${hasBackgroundColor ? "" : "bg-white"} rounded-lg border border-gray-200 shadow-sm`;

	const paddingClasses = {
		none: "",
		sm: "p-3",
		md: "p-4",
		lg: "p-6",
	};

	return (
		<div className={`${baseClasses} ${paddingClasses[padding]} ${className}`}>
			{children}
		</div>
	);
};

export default Card;
