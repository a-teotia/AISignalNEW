import React, { ReactNode, useState } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, side = "top" }) => {
  const [visible, setVisible] = useState(false);
  let positionClass = "";
  switch (side) {
    case "top":
      positionClass = "bottom-full left-1/2 -translate-x-1/2 mb-2";
      break;
    case "bottom":
      positionClass = "top-full left-1/2 -translate-x-1/2 mt-2";
      break;
    case "left":
      positionClass = "right-full top-1/2 -translate-y-1/2 mr-2";
      break;
    case "right":
      positionClass = "left-full top-1/2 -translate-y-1/2 ml-2";
      break;
  }
  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      tabIndex={0}
    >
      {children}
      {visible && (
        <span
          className={`absolute z-50 px-3 py-2 rounded-lg bg-gray-900 text-xs text-blue-100 shadow-lg pointer-events-none whitespace-nowrap ${positionClass} animate-fade-in`}
        >
          {content}
        </span>
      )}
    </span>
  );
}; 