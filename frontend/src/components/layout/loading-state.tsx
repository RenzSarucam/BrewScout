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
          <linearGradient id="brew-mug-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0a45c" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
          <radialGradient id="brew-glow-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ambient glow */}
        <circle cx="60" cy="68" r="46" fill="url(#brew-glow-gradient)" className="animate-brew-glow" />

        {/* faint scanning map roads */}
        <g stroke="var(--border)" strokeWidth="2" strokeDasharray="4 6" className="animate-brew-scan">
          <path d="M8 40 H112" />
          <path d="M8 96 H112" />
          <path d="M36 12 V124" />
          <path d="M84 12 V124" />
        </g>

        {/* contact shadow */}
        <ellipse cx="60" cy="106" rx="24" ry="5" fill="black" opacity="0.3" />

        <g className="animate-brew-cup-bob">
          {/* steam rising off the cup */}
          <path
            d="M52 46 Q47 39 52 33 Q57 27 52 20"
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-brew-steam"
          />
          <path
            d="M64 46 Q59 39 64 33 Q69 27 64 20"
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-brew-steam"
            style={{ animationDelay: "0.6s" }}
          />

          {/* saucer */}
          <ellipse cx="60" cy="100" rx="26" ry="5" fill="var(--card)" stroke="var(--primary)" strokeWidth="1.5" />

          {/* mug */}
          <path
            d="M34 52 H82 L78 90 Q77 98 68 98 H48 Q39 98 38 90 Z"
            fill="url(#brew-mug-gradient)"
            stroke="#b5691f"
            strokeWidth="1.5"
          />
          <path
            d="M82 60 Q96 60 96 71 Q96 82 82 80"
            fill="none"
            stroke="url(#brew-mug-gradient)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <ellipse cx="58" cy="52" rx="24" ry="6" fill="#3b2417" />
          <ellipse cx="58" cy="51" rx="24" ry="5.2" fill="#5a3a24" />
        </g>

        {/* magnifying glass, scouting around the cup */}
        <g className="animate-brew-scout-sweep">
          <circle cx="38" cy="30" r="13" fill="var(--card)" fillOpacity="0.25" stroke="var(--foreground)" strokeWidth="4" />
          <path d="M47 39 L58 50" stroke="var(--foreground)" strokeWidth="5" strokeLinecap="round" />
          <path
            d="M32 24 Q36 20 42 22"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0"
            className="animate-brew-glint"
          />
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