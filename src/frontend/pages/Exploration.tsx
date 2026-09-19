import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, type ExplorationMessage } from "../lib/api";
import { AnswerInput } from "../components/exploration/AnswerInput";
import { QuestionDisplay, AnswerEcho } from "../components/exploration/QuestionDisplay";
import { Spark } from "../components/ui/Spark";
import { Button } from "../components/ui/Button";

export default function Exploration() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ExplorationMessage[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.explorations.get(id).then((res) => {
      setMessages(res.messages);
      setTitle(res.exploration.title);
      setLoading(false);
    });
  }, [id]);

  async function handleAnswer(value: string) {
    if (!id) return;
    setSending(true);
    setMessages((m) => [...m, { role: "answer", content: value, created_at: new Date().toISOString() }]);

    const res = await api.explorations.sendMessage(id, value);
    setSending(false);
    setMessages((m) => [
      ...m,
      { role: "question", content: res.question, created_at: new Date().toISOString() },
    ]);
  }

  async function handleIdea() {
    if (!id) return;
    const idea = window.prompt("Qual é a tua ideia?");
    if (!idea?.trim()) return;
    const res = await api.ideas.create(idea.trim(), id);
    navigate(`/exploration/${res.explorationId}`);
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-prose items-center px-6">
        <Spark label="a carregar a exploração..." />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-prose px-6 py-16">
      <p className="mb-8 text-sm text-paper-faint">{title}</p>

      <div className="flex flex-col gap-8">
        {messages.map((m, i) =>
          m.role === "question" ? (
            <QuestionDisplay key={i} text={m.content} />
          ) : m.role === "idea" ? (
            <p key={i} className="font-display text-xl italic text-bloom">"{m.content}"</p>
          ) : (
            <AnswerEcho key={i} text={m.content} />
          )
        )}
      </div>

      <div className="mt-10 flex flex-col gap-4">
        {sending ? <Spark label="a pensar na próxima pergunta..." /> : <AnswerInput onSubmit={handleAnswer} />}
        <div>
          <Button variant="ghost" onClick={handleIdea}>
            Tive uma ideia
          </Button>
        </div>
      </div>
    </div>
  );
}
