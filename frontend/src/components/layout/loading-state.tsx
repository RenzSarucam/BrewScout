import Image from "next/image";

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = "Brewing...", className = "" }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center ${className}`}
    >
      <div className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <Image src="/logo-icon.png" alt="" width={36} height={36} className="rounded-full" aria-hidden="true" />
      </div>
      <p className="animate-pulse text-sm text-muted-foreground">{label}</p>
      <span className="sr-only">Loading</span>
    </div>
  );
}