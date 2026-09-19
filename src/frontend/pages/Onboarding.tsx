import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { AnswerInput } from "../components/exploration/AnswerInput";
import { QuestionDisplay, AnswerEcho } from "../components/exploration/QuestionDisplay";
import { Spark } from "../components/ui/Spark";

interface HistoryItem {
  question: string;
  answer?: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.onboarding.steps().then((res) => {
      setSteps(res.steps);
      setHistory([{ question: res.steps[0] }]);
    });
  }, []);

  async function handleAnswer(value: string) {
    setLoading(true);
    setHistory((h) => h.map((item, i) => (i === h.length - 1 ? { ...item, answer: value } : item)));

    const res = await api.onboarding.answer(step, value);
    setLoading(false);

    if (res.done || res.nextQuestion === null) {
      setDone(true);
      return;
    }

    setStep(res.nextStep!);
    setHistory((h) => [...h, { question: res.nextQuestion! }]);
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-screen max-w-prose flex-col items-start justify-center px-6">
        <p className="font-display text-2xl text-paper">Boa. Já sei por onde começar.</p>
        <button
          onClick={() => navigate("/home")}
          className="mt-8 rounded-full bg-spark px-5 py-2.5 text-sm font-medium text-ink hover:opacity-90"
        >
          Ver a minha exploração
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-prose px-6 py-16">
      <div className="flex flex-col gap-8">
        {history.map((item, i) => (
          <div key={i} className="flex flex-col gap-4">
            <QuestionDisplay text={item.question} />
            {item.answer && <AnswerEcho text={item.answer} />}
          </div>
        ))}
      </div>

      <div className="mt-10">
        {loading ? <Spark label="a pensar..." /> : <AnswerInput onSubmit={handleAnswer} disabled={steps.length === 0} />}
      </div>
    </div>
  );
}
