import { useSeoMeta } from '@unhead/react';
import { Button } from "@/components/ui/button";
import { CreateHexedNoteDialog } from "@/components/CreateHexedNoteDialog";
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, MessageSquareCode } from 'lucide-react';

const featureHighlights = [
  {
    title: 'Ciphered Stories',
    description: 'Craft messages that glow with atmosphere and only bloom when the right phrase is whispered.',
  },
  {
    title: 'Mind-First Security',
    description: 'Swap seed phrases for riddles. Your friends unlock the secret by thinking, not copying.',
  },
  {
    title: 'Relay Native',
    description: 'Every hexed note lives on Nostr, so your puzzles travel anywhere your audience already is.',
  },
];

const Index = () => {
  const navigate = useNavigate();

  useSeoMeta({
    title: 'Hexed Notes — Puzzle-locked Nostr messages',
    description: 'Compose riddle-protected notes that spark curiosity and only reveal themselves to the clever.',
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-600/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute top-32 right-0 h-56 w-56 rounded-full bg-blue-500/30 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-20">
        <section className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_1fr] lg:items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-purple-200">
              <Sparkles className="h-4 w-4" />
              Hexed Notes
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Send secrets that shimmer behind riddles.
              </h1>
              <p className="max-w-xl text-lg text-slate-300">
                Put a hex on your notes and let your friends cast spells to remove the hex and decode your secret message.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <CreateHexedNoteDialog
                trigger={
                  <Button size="lg" className="h-12 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-400 px-8 text-base font-medium text-slate-50 shadow-xl shadow-purple-900/30">
                    Cast a Hexed Note
                  </Button>
                }
              />
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/hexed-notes')}
                className="h-12 rounded-full border-slate-700 bg-slate-900/70 px-8 text-base text-slate-200 backdrop-blur transition hover:border-slate-500"
              >
                Browse Hexed Notes
              </Button>
            </div>

            <p className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <Shield className="h-4 w-4 text-slate-500" />
              <span>
                Vibed with <a href="https://soapbox.pub/mkstack" className="text-purple-200 underline decoration-dotted underline-offset-4" target="_blank" rel="noreferrer">MKStack</a>
              </span>
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-purple-500/30 via-purple-500/10 to-transparent blur-3xl" />
            <div className="relative space-y-6 rounded-3xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl">
              <header className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg">
                  <MessageSquareCode className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-purple-200">Demo Sigil</p>
                  <p className="text-lg font-semibold">“Riddle: speak friend and enter.”</p>
                </div>
              </header>

              <div className="space-y-4 rounded-2xl border border-purple-500/40 bg-slate-950/60 p-6 shadow-[0_0_40px_-20px] shadow-purple-500/60">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Encrypted Content</p>
                <div className="rounded-xl bg-slate-900/80 p-4 font-mono text-sm text-purple-200">
{`Whoever solves the rune gets the whispered coordinates...
(Answer: mellon)`}
                </div>
                <p className="text-xs text-slate-500">
                  Every answer is normalized (case + spacing) before unlocking the note.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24 grid gap-6 lg:grid-cols-3">
          {featureHighlights.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/50 p-8 transition hover:border-purple-400/50 hover:shadow-[0_30px_120px_-60px_rgba(168,85,247,0.8)]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-purple-500/20 to-transparent opacity-0 transition group-hover:opacity-100" />
              <h2 className="text-xl font-semibold text-slate-50">{feature.title}</h2>
              <p className="mt-4 text-sm text-slate-300">{feature.description}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Index;
