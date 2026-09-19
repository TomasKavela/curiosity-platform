export function Spark({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-paper-dim">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-spark opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-spark" />
      </span>
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
