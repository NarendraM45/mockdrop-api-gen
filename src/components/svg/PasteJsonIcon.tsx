import React from "react";

interface Props {
  className?: string;
}

export const PasteJsonIcon: React.FC<Props> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Two curly braces representing JSON */}
    <path d="M8 4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);
