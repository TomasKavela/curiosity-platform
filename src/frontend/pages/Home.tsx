import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type ExplorationSummaryItem } from "../lib/api";
import { Button } from "../components/ui/Button";

export default function Home() {
  const navigate = useNavigate();
  const [explorations, setExplorations] = useState<ExplorationSummaryItem[]>([]);
  const [starter, setStarter] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    api.explorations.list().then((res) => setExplorations(res.explorations));
  }, []);

  async function startExploration() {
    const trimmed = starter.trim();
    if (!trimmed) return;
    setStarting(true);
    const res = await api.explorations.create(trimmed, "guided");
    navigate(`/exploration/${res.explorationId}`);
  }

  const active = explorations.filter((e) => e.status === "active");

  return (
    <div className="mx-auto min-h-screen max-w-prose px-6 py-16">
      <p className="text-sm text-paper-faint">o que tens curiosidade em descobrir?</p>

      <textarea
        value={starter}
        onChange={(e) => setStarter(e.target.value)}
        placeholder="Escreve sobre um hobby, uma dúvida, ou qualquer coisa que te ocupe a cabeça..."
        rows={3}
        className="mt-4 w-full resize-none rounded-2xl border border-ink-line bg-ink-surface px-4 py-3 font-display text-lg text-paper placeholder:text-paper-faint focus:border-spark focus:outline-none"
      />

      <div className="mt-4 flex gap-3">
        <Button onClick={startExploration} disabled={starting || !starter.trim()}>
          Quero explorar
        </Button>
        <Button variant="ghost" onClick={() => navigate("/idea")}>
          Tive outra ideia
        </Button>
      </div>

      {active.length > 0 && (
        <div className="mt-16">
          <p className="mb-4 text-sm text-paper-faint">continuar a explorar</p>
          <div className="flex flex-col gap-2">
            {active.map((exp) => (
              <button
                key={exp.id}
                onClick={() => navigate(`/exploration/${exp.id}`)}
                className="rounded-xl border border-ink-line px-4 py-3 text-left text-paper-dim transition-colors hover:border-spark hover:text-paper"
              >
                {exp.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
