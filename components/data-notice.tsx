export function DataNotice() {
  return (
    <p role="status" className="rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm text-muted-foreground">
      Sample data is shown while live analytics is unavailable. Counts and growth figures are illustrative.
      You can still search public repositories on GitHub.
    </p>
  );
}
