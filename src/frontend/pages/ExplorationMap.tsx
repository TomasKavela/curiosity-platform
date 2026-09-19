import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type ExplorationSummaryItem } from "../lib/api";

export default function ExplorationMap() {
  const navigate = useNavigate();
  const [explorations, setExplorations] = useState<ExplorationSummaryItem[]>([]);

  useEffect(() => {
    api.explorations.list().then((res) => setExplorations(res.explorations));
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-prose px-6 py-16">
      <p className="mb-8 text-sm text-paper-faint">o teu percurso</p>

      <div className="relative flex flex-col gap-6 border-l border-ink-line pl-6">
        {explorations.map((exp) => (
          <button
            key={exp.id}
            onClick={() => navigate(`/exploration/${exp.id}`)}
            className="relative text-left"
          >
            <span className="absolute -left-[29px] top-1.5 h-2 w-2 rounded-full bg-spark" />
            <p className="text-paper-dim transition-colors hover:text-paper">{exp.title}</p>
            <p className="text-xs text-paper-faint">
              {exp.origin === "spontaneous" ? "ideia espontânea" : "exploração guiada"}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
