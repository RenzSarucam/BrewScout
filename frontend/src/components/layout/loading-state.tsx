interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = "Scout your coffee...", className = "" }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex min-h-[50vh] flex-col items-center justify-center gap-5 px-6 py-16 text-center ${className}`}
    >
      <svg viewBox="0 0 100 100" width="88" height="88" aria-hidden="true" className="overflow-visible">
        {/* faint map roads for context */}
        <g className="animate-brew-scan" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 5">
          <path d="M6 30 H94" />
          <path d="M6 66 H94" />
          <path d="M30 6 V94" />
          <path d="M70 6 V94" />
        </g>

        {/* radar pings scouting outward from the pin's tip */}
        <circle cx="50" cy="82" r="5" fill="none" stroke="var(--primary)" strokeWidth="2" className="animate-brew-ping" style={{ animationDelay: "0s" }} />
        <circle cx="50" cy="82" r="5" fill="none" stroke="var(--primary)" strokeWidth="2" className="animate-brew-ping" style={{ animationDelay: "0.9s" }} />

        <g className="animate-brew-pin-drop">
          {/* map pin */}
          <path
            d="M50 18 C35 18 24 29 24 44 C24 62 50 82 50 82 C50 82 76 62 76 44 C76 29 65 18 50 18 Z"
            fill="var(--primary)"
          />
          {/* coffee cup silhouette inside the pin */}
          <path
            d="M39 38 H57 L55 50 Q54 55 49 55 H47 Q42 55 41 50 Z"
            fill="var(--card)"
          />
          <path d="M57 41 Q64 41 64 46 Q64 51 57 50" fill="none" stroke="var(--card)" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>

      <p className="animate-pulse text-sm text-muted-foreground">{label}</p>
      <span className="sr-only">Loading</span>
    </div>
  );
}