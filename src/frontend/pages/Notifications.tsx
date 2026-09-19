import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Notifications() {
  const [items, setItems] = useState<Array<{ id: string; content: string; read: number }>>([]);

  useEffect(() => {
    api.notifications.list().then((res) => setItems(res.notifications));
  }, []);

  async function markRead(id: string) {
    await api.notifications.markRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: 1 } : n)));
  }

  return (
    <div className="mx-auto min-h-screen max-w-prose px-6 py-16">
      <p className="mb-8 text-sm text-paper-faint">notificações</p>

      {items.length === 0 ? (
        <p className="text-paper-dim">Sem novidades por agora.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`rounded-xl border px-4 py-3 text-left font-display italic transition-colors ${
                n.read ? "border-ink-line text-paper-faint" : "border-spark/50 text-paper"
              }`}
            >
              "{n.content}"
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
