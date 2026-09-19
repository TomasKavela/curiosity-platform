import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type ExplorationSummaryItem } from "../lib/api";

export default function History() {
  const navigate = useNavigate();
  const [explorations, setExplorations] = useState<ExplorationSummaryItem[]>([]);

  useEffect(() => {
    api.explorations.list().then((res) => setExplorations(res.explorations));
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-prose px-6 py-16">
      <p className="mb-8 text-sm text-paper-faint">histórico de explorações</p>

      {explorations.length === 0 ? (
        <p className="text-paper-dim">Ainda não começaste nenhuma exploração.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {explorations.map((exp) => (
            <button
              key={exp.id}
              onClick={() => navigate(`/exploration/${exp.id}`)}
              className="flex items-center justify-between rounded-xl border border-ink-line px-4 py-3 text-left transition-colors hover:border-spark"
            >
              <span className="text-paper-dim">{exp.title}</span>
              <span className="text-xs text-paper-faint">{exp.status}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
