'use client';

import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
}

export function CopyButton({ text, ariaLabel, children, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      aria-label={ariaLabel}
    >
      {copied ? (
        <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}