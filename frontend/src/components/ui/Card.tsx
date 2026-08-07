import React from "react";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl
        bg-white/70
        backdrop-blur-md
        border border-white/30
        shadow-lg
        p-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Card;