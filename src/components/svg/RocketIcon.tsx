import React from "react";

interface Props {
  className?: string;
}

export const RocketIcon: React.FC<Props> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Simplified rocket shape */}
    <path d="M12 2 L12 22" />
    <path d="M5 9 L19 9" />
    <path d="M5 15 L19 15" />
  </svg>
);
