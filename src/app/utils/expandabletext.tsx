"use client";

import { useState } from "react";

export default function ExpandableText({ text, limit = 100 }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (text.length <= limit) return <p>{text}</p>;

  return (
    <div>
      <p className="text-sm text-card-foreground ">{isExpanded ? text : `${text.substring(0, limit)}...`}</p>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-500 hover:underline text-sm mt-1"
      >
        {isExpanded ? "Show Less" : "Read More"}
      </button>
    </div>
  );
}