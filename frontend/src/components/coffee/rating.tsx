interface RatingProps {
  value: number | null;
  reviewCount?: number;
  className?: string;
}

export function Rating({ value, reviewCount, className = "" }: RatingProps) {
  if (value === null) {
    return <span className={`text-sm text-muted-foreground ${className}`}>No rating yet</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium text-foreground ${className}`}>
      <span aria-hidden="true" className="text-primary">
        ★
      </span>
      {value.toFixed(1)}
      {typeof reviewCount === "number" && (
        <span className="font-normal text-muted-foreground">({reviewCount.toLocaleString()})</span>
      )}
    </span>
  );
}