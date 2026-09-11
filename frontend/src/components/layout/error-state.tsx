import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong.",
  description = "Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <p className="text-base font-medium text-foreground">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}