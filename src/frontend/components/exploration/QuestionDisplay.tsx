import { momentTypeFor, MOMENT_LABEL, type MomentType } from "../../lib/momentType";

export function MomentDisplay({ text, strategy }: { text: string; strategy?: string | null }) {
  const momentType = momentTypeFor(strategy);

  if (momentType === "question") {
    return <p className="font-display text-2xl leading-snug text-paper sm:text-3xl">{text}</p>;
  }

  const styles: Record<Exclude<MomentType, "question">, string> = {
    insight: "border-spark/40 bg-spark/5 text-paper",
    simulation: "border-bloom/40 bg-bloom/5 text-paper",
    reflection: "border-ink-line bg-transparent text-paper-dim italic",
    experiment: "border-bloom/50 bg-bloom/10 text-paper",
  };

  return (
    <div className={`rounded-2xl border px-5 py-4 ${styles[momentType]}`}>
      {MOMENT_LABEL[momentType] && (
        <p className="mb-1.5 text-xs uppercase tracking-wide text-paper-faint">
          {MOMENT_LABEL[momentType]}
        </p>
      )}
      <p className="font-display text-lg leading-snug sm:text-xl">{text}</p>
    </div>
  );
}

export function AnswerEcho({ text }: { text: string }) {
  return (
    <p className="border-l-2 border-ink-line pl-4 text-base leading-relaxed text-paper-dim">{text}</p>
  );
}