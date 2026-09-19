import { useEffect, useState } from "react";
import { api, type Profile as ProfileType } from "../lib/api";
import { Button } from "../components/ui/Button";

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm text-paper-faint">nada ainda</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((tag) => (
        <span key={tag} className="rounded-full border border-ink-line px-3 py-1 text-sm text-paper-dim">
          {tag}
        </span>
      ))}
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileType | null>(null);

  useEffect(() => {
    api.profile.get().then(setProfile);
  }, []);

  async function confirmCandidate() {
    if (!profile) return;
    await api.profile.patch({ confirmed: profile.candidate });
    const refreshed = await api.profile.get();
    setProfile(refreshed);
  }

  if (!profile) return null;

  const hasCandidates =
    (profile.candidate.interests?.length ?? 0) +
      (profile.candidate.hobbies?.length ?? 0) +
      (profile.candidate.technicalInterests?.length ?? 0) >
    0;

  return (
    <div className="mx-auto min-h-screen max-w-prose px-6 py-16">
      <p className="mb-8 text-sm text-paper-faint">o teu perfil de curiosidade</p>

      <div className="flex flex-col gap-8">
        <div>
          <p className="mb-2 text-sm text-paper-faint">interesses</p>
          <TagList items={profile.confirmed.interests ?? []} />
        </div>
        <div>
          <p className="mb-2 text-sm text-paper-faint">hobbies</p>
          <TagList items={profile.confirmed.hobbies ?? []} />
        </div>
        <div>
          <p className="mb-2 text-sm text-paper-faint">interesses técnicos</p>
          <TagList items={profile.confirmed.technicalInterests ?? []} />
        </div>
      </div>

      {hasCandidates && (
        <div className="mt-12 rounded-2xl border border-spark/40 bg-ink-surface p-6">
          <p className="mb-3 font-display text-lg text-paper">
            Reparei nalguns interesses novos enquanto explorávamos.
          </p>
          <div className="mb-4 flex flex-col gap-3">
            <TagList
              items={[
                ...(profile.candidate.interests ?? []),
                ...(profile.candidate.hobbies ?? []),
                ...(profile.candidate.technicalInterests ?? []),
              ]}
            />
          </div>
          <Button onClick={confirmCandidate}>Confirmar no meu perfil</Button>
        </div>
      )}
    </div>
  );
}
