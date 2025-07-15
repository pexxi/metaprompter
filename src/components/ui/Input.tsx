import type React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
	label,
	error,
	fullWidth = false,
	className = "",
	...props
}) => {
	const baseClasses =
		"px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
	const errorClasses = error
		? "border-red-300 focus:ring-red-500 focus:border-red-500"
		: "";
	const widthClasses = fullWidth ? "w-full" : "";

	return (
		<div className={fullWidth ? "w-full" : ""}>
			{label && (
				<label className="block text-sm font-medium text-gray-700 mb-1">
					{label}
				</label>
			)}
			<input
				className={`${baseClasses} ${errorClasses} ${widthClasses} ${className}`}
				{...props}
			/>
			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
		</div>
	);
};

export default Input;
