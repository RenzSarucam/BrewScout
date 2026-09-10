interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = "Scout your coffee...", className = "" }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex min-h-[50vh] flex-col items-center justify-center gap-6 px-6 py-16 text-center ${className}`}
    >
      <svg viewBox="0 0 120 130" width="150" height="163" aria-hidden="true" className="overflow-visible">
        <defs>
          <linearGradient id="brew-pin-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0a45c" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
          <radialGradient id="brew-glow-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ambient glow */}
        <circle cx="60" cy="55" r="46" fill="url(#brew-glow-gradient)" className="animate-brew-glow" />

        {/* faint scanning map roads */}
        <g stroke="var(--border)" strokeWidth="2" strokeDasharray="4 6" className="animate-brew-scan">
          <path d="M8 36 H112" />
          <path d="M8 80 H112" />
          <path d="M36 8 V122" />
          <path d="M84 8 V122" />
        </g>

        {/* contact shadow, breathes opposite the pin's bounce */}
        <ellipse cx="60" cy="112" rx="20" ry="5" fill="black" className="animate-brew-shadow-pulse" />

        {/* radar pings scouting outward from the pin's tip */}
        {[0, 0.65, 1.3].map((delay) => (
          <circle
            key={delay}
            cx="60"
            cy="100"
            r="6"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            className="animate-brew-ping"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}

        <g className="animate-brew-pin-drop">
          {/* steam rising off the cup */}
          <path
            d="M55 34 Q50 27 55 21 Q60 15 55 8"
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-brew-steam"
          />

          {/* map pin */}
          <path
            d="M60 22 C42 22 29 35 29 52 C29 74 60 100 60 100 C60 100 91 74 91 52 C91 35 78 22 60 22 Z"
            fill="url(#brew-pin-gradient)"
            stroke="#b5691f"
            strokeWidth="1.5"
          />
          <ellipse cx="60" cy="52" rx="30" ry="7" fill="white" opacity="0.08" />

          {/* coffee cup silhouette inside the pin */}
          <path d="M46 44 H70 L67 60 Q66 66 59 66 H57 Q50 66 49 60 Z" fill="var(--card)" />
          <path
            d="M70 48 Q80 48 80 55 Q80 62 70 61"
            fill="none"
            stroke="var(--card)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="58" cy="55" r="2.4" fill="var(--primary)" />
        </g>
      </svg>

      <p className="text-base font-medium tracking-wide text-muted-foreground">
        {label.replace(/\.*$/, "")}
        <span className="inline-block w-6 text-left">
          <span className="animate-pulse [animation-delay:0s]">.</span>
          <span className="animate-pulse [animation-delay:0.2s]">.</span>
          <span className="animate-pulse [animation-delay:0.4s]">.</span>
        </span>
      </p>
      <span className="sr-only">Loading</span>
    </div>
  );
}