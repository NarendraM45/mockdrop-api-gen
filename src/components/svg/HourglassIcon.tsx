import React from "react";

interface Props {
  className?: string;
}

export const HourglassIcon: React.FC<Props> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 2h12v4l-3 3 3 3v4H6v-4l3-3-3-3V2z" />
  </svg>
);
