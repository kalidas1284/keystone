import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`
        w-full
        rounded-lg
        border
        border-slate-300
        px-4
        py-2.5
        outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:border-blue-500
        transition
        ${className}
      `}
    />
  );
}

export default Input;