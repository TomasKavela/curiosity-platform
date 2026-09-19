import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

const SAMPLE_QUESTIONS = [
  "E se estivesses a resolver o problema errado?",
  "E se a limitação fosse uma vantagem?",
  "O que ninguém está a perguntar?",
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen max-w-prose flex-col justify-center px-6 py-24">
      <p className="mb-6 text-sm text-paper-faint">uma plataforma de curiosidade</p>

      <h1 className="font-display text-4xl leading-tight text-paper sm:text-5xl">
        Entraste curioso sobre uma coisa.
        <br />
        <span className="text-spark">Vais sair curioso sobre outra.</span>
      </h1>

      <p className="mt-6 max-w-md text-paper-dim">
        Parte de um hobby, uma dúvida, uma ideia solta. Cada resposta abre a pergunta seguinte —
        nunca aulas, nunca pontos, nunca um percurso fixo.
      </p>

      <div className="mt-10 flex flex-col gap-3">
        {SAMPLE_QUESTIONS.map((q) => (
          <p key={q} className="font-display text-lg italic text-paper-dim">
            "{q}"
          </p>
        ))}
      </div>

      <div className="mt-12">
        <Button onClick={() => navigate("/onboarding")}>Começar a explorar</Button>
      </div>
    </div>
  );
}
