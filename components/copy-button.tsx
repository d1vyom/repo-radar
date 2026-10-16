'use client';

import { useState, useEffect, useRef } from 'react';

interface CopyButtonProps {
  text: string;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
}

export function CopyButton({ text, ariaLabel, children, className = '' }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    timer.current = setTimeout(() => setState('idle'), 3000);
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      aria-label={state === 'copied' ? 'Copied clone command' : ariaLabel}
      title={state === 'failed' ? 'Copy failed. Select and copy the command manually.' : ariaLabel}
    >
      {state === 'failed' ? <span role="status" className="text-danger">Copy failed</span> : state === 'copied' ? (
        <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}
