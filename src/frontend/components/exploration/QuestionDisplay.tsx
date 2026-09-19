export function QuestionDisplay({ text }: { text: string }) {
  return (
    <p className="font-display text-2xl leading-snug text-paper sm:text-3xl">{text}</p>
  );
}

export function AnswerEcho({ text }: { text: string }) {
  return (
    <p className="border-l-2 border-ink-line pl-4 text-base leading-relaxed text-paper-dim">{text}</p>
  );
}
