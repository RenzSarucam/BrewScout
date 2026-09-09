interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = "Brewing your coffee...", className = "" }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex min-h-[50vh] flex-col items-center justify-center gap-5 px-6 py-16 text-center ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        width="72"
        height="72"
        aria-hidden="true"
        className="overflow-visible"
      >
        <g className="animate-brew-steam" style={{ animationDelay: "0s" }}>
          <path
            d="M40 38 Q34 30 40 24 Q46 18 40 10"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        <g className="animate-brew-steam" style={{ animationDelay: "0.6s" }}>
          <path
            d="M50 38 Q44 30 50 24 Q56 18 50 10"
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        <g className="animate-brew-steam" style={{ animationDelay: "1.2s" }}>
          <path
            d="M60 38 Q54 30 60 24 Q66 18 60 10"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        <g className="animate-brew-cup-bob">
          <path
            d="M28 46 H72 L67 78 Q66 86 58 86 H42 Q34 86 33 78 Z"
            fill="var(--card)"
            stroke="var(--primary)"
            strokeWidth="3"
          />
          <ellipse cx="50" cy="46" rx="22" ry="5" fill="var(--primary)" />
          <path
            d="M72 52 Q86 52 86 63 Q86 74 72 72"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
      </svg>

      <p className="animate-pulse text-sm text-muted-foreground">{label}</p>
      <span className="sr-only">Loading</span>
    </div>
  );
}