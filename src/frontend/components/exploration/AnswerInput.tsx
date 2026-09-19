import { useState, type FormEvent } from "react";

interface AnswerInputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function AnswerInput({ onSubmit, disabled, placeholder = "A tua resposta..." }: AnswerInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className="w-full resize-none rounded-2xl border border-ink-line bg-ink-surface px-4 py-3 text-paper placeholder:text-paper-faint focus:border-spark focus:outline-none disabled:opacity-50"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="rounded-full bg-spark px-5 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-30"
        >
          Responder
        </button>
      </div>
    </form>
  );
}
