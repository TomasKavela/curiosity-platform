import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Spark } from "../components/ui/Spark";

export default function Idea() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  async function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    setSending(true);
    const res = await api.ideas.create(trimmed);
    navigate(`/exploration/${res.explorationId}`);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-prose flex-col justify-center px-6">
      <p className="font-display text-2xl text-paper">Tive uma ideia...</p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        autoFocus
        placeholder="E se..."
        className="mt-6 w-full resize-none rounded-2xl border border-ink-line bg-ink-surface px-4 py-3 font-display text-lg text-paper placeholder:text-paper-faint focus:border-spark focus:outline-none"
      />
      <div className="mt-4">
        {sending ? <Spark label="a explorar..." /> : <Button onClick={submit} disabled={!value.trim()}>Explorar esta ideia</Button>}
      </div>
    </div>
  );
}
