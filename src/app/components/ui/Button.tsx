import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "base" | "selected";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "base",
  onClick,
  disabled = false,
  className = "",
  type = "button",
}) => {
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
