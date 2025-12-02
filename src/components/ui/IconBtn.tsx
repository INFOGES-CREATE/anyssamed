//src\components\ui\IconBtn.tsx

"use client";

import React from "react";

interface IconBtnProps {
  icon: React.ReactNode;
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  className?: string;
}

export default function IconBtn({
  icon,
  onClick,
  title,
  disabled = false,
  className = ""
}: IconBtnProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded-xl bg-white dark:bg-gray-800 border 
                  border-gray-300 dark:border-gray-700 hover:bg-gray-100 
                  dark:hover:bg-gray-700 transition-all shadow-sm flex 
                  items-center justify-center ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                  ${className}`}
    >
      {icon}
    </button>
  );
}
