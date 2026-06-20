import React, { useState, useEffect } from "react";

interface Props {
  className?: string;
}

export const BadgeIcon: React.FC<Props> = ({ className }) => {
  const [code, setCode] = useState<number>(200);
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const start = () => {
      const codes = [200, 404, 500, 201];
      let i = 0;
      interval = setInterval(() => {
        setCode(codes[i % codes.length]);
        i++;
      }, 150);
    };
    const stop = () => {
      if (interval) clearInterval(interval);
      setCode(200);
    };
    // expose handlers via mouse events on the parent container
    const parent = document.getElementById("badge-icon-wrapper");
    parent?.addEventListener("mouseenter", start);
    parent?.addEventListener("mouseleave", stop);
    return () => {
      if (interval) clearInterval(interval);
      parent?.removeEventListener("mouseenter", start);
      parent?.removeEventListener("mouseleave", stop);
    };
  }, []);

  return (
    <div id="badge-icon-wrapper" className={className} style={{ position: "relative" }}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Simple chain‑link shape */}
        <path d="M7 12l1.5 1.5M9 9l6 6" />
        <path d="M17 12l-1.5-1.5" />
      </svg>
      <span
        style={{
          position: "absolute",
          top: "-6px",
          right: "-6px",
          background: "var(--primary)",
          color: "white",
          borderRadius: "0.25rem",
          padding: "0 0.25rem",
          fontSize: "0.6rem",
          fontFamily: "monospace",
        }}
      >
        {code}
      </span>
    </div>
  );
};
