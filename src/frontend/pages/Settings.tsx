import { useEffect, useState } from "react";
import { api, type Profile } from "../lib/api";
import { Button } from "../components/ui/Button";

export default function Settings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.profile.get().then((p) => {
      setProfile(p);
      setDisplayName(p.displayName ?? "");
    });
  }, []);

  async function save() {
    await api.profile.patch({ displayName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!profile) return null;

  return (
    <div className="mx-auto min-h-screen max-w-prose px-6 py-16">
      <p className="mb-8 text-sm text-paper-faint">definições</p>

      <label className="mb-2 block text-sm text-paper-dim">Como preferes que te tratemos?</label>
      <input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="w-full rounded-xl border border-ink-line bg-ink-surface px-4 py-2.5 text-paper focus:border-spark focus:outline-none"
      />

      <div className="mt-4">
        <Button onClick={save}>{saved ? "Guardado" : "Guardar"}</Button>
      </div>
    </div>
  );
}
