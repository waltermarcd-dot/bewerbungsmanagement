import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import StepJobInput from "@/components/anschreiben/StepJobInput";
import StepResumeUpload from "@/components/anschreiben/StepResumeUpload";
import StepResult from "@/components/anschreiben/StepResult";
import { motion, AnimatePresence } from "framer-motion";
import ImpressumModal from "@/components/anschreiben/ImpressumModal";
import AgbModal from "@/components/anschreiben/AgbModal";
import DsgvoModal from "@/components/anschreiben/DsgvoModal";
import { FileText, Briefcase, Download, Loader2, ArrowLeft, PenLine } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import JobfertigLogo from "@/components/JobfertigLogo";

const STEPS = [
  { id: 1, label: "Stelle", icon: Briefcase },
  { id: 2, label: "Lebenslauf", icon: FileText },
  { id: 3, label: "Anschreiben", icon: Download },
];

export default function Generator() {
  const { user, logout, isAuthenticated, navigateToLogin } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [jobData, setJobData] = useState(null);
  const [coverLetter, setCoverLetter] = useState(null);
  const [showImpressum, setShowImpressum] = useState(false);
  const [showAgb, setShowAgb] = useState(false);
  const [showDsgvo, setShowDsgvo] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#f1f5f9] gap-6">
        <div className="bg-[#111] rounded-2xl px-8 py-6 inline-block mb-2">
          <JobfertigLogo />
        </div>
        <div className="text-center space-y-4">
          <p className="text-gray-500 text-sm">Bitte melde dich an, um fortzufahren.</p>
          <button onClick={navigateToLogin}
            className="px-6 py-3 bg-[#1a3a2a] text-white font-semibold rounded-xl hover:bg-[#2d5a3d] transition-colors shadow-sm">
            Anmelden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9]">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* Links: Zurück + Icon + Titel */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mr-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Startseite</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1a3a2a] flex items-center justify-center flex-shrink-0">
                <PenLine className="w-3.5 h-3.5 text-[#f5c842]" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-sm text-gray-900 tracking-tight">Anschreiben-Generator</span>
                <span className="text-[10px] text-gray-400 hidden sm:block">Überzeugend. In Minuten.</span>
              </div>
            </div>
          </div>

          {/* Mitte: Schritt-Indikatoren */}
          <div className="hidden sm:flex items-center gap-2">
            {STEPS.map((s, i) => {
              const active = step === s.id;
              const done = step > s.id;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      active ? "bg-[#1a3a2a] text-[#f5c842] shadow-sm"
                      : done ? "bg-[#1a3a2a]/20 text-[#1a3a2a]"
                      : "bg-gray-100 text-gray-400"
                    }`}>
                      {done ? "✓" : s.id}
                    </div>
                    <span className={`text-xs font-medium hidden sm:inline transition-all ${
                      active ? "text-[#1a3a2a] font-semibold"
                      : done ? "text-gray-400"
                      : "text-gray-300"
                    }`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-8 h-px transition-all ${done ? "bg-[#1a3a2a]/30" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Rechts: User + Logout */}
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 hidden md:block">{user.email}</span>
              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1 rounded-lg transition-colors"
              >
                Abmelden
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="max-w-2xl mx-auto px-6 pt-10 pb-16">
        <AnimatePresence mode="wait">

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
              <StepJobInput
                onNext={(data) => { setJobData(data); setStep(2); }}
                onBack={() => navigate('/')}
              />
            </motion.div>
          )}

          {step === 2 && !isGenerating && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
              <StepResumeUpload
                jobData={jobData}
                onBack={() => setStep(1)}
                onGenerating={() => setIsGenerating(true)}
                onNext={(letter) => { setIsGenerating(false); setCoverLetter(letter); setStep(3); }}
              />
            </motion.div>
          )}

          {/* Ladescreen */}
          {isGenerating && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#1a3a2a] flex items-center justify-center shadow-sm">
                <Loader2 className="w-8 h-8 text-[#f5c842] animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">Wir schreiben jetzt dein Anschreiben…</h2>
                <p className="text-sm text-gray-500 max-w-xs">
                  Wir gleichen deinen Lebenslauf mit der Stelle ab und formulieren ein maßgeschneidertes Anschreiben für dich.
                </p>
              </div>
              <div className="flex gap-1.5 mt-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#1a3a2a]/30 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <StepResult
                coverLetter={coverLetter}
                jobData={jobData}
                user={user}
                onBack={() => setStep(2)}
                onRestart={() => { setStep(1); setJobData(null); setCoverLetter(null); }}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white mt-4 py-4">
        <div className="max-w-2xl mx-auto px-6 flex justify-center gap-4 text-xs text-gray-400">
          <button onClick={() => setShowImpressum(true)} className="hover:text-gray-600 transition-colors">Impressum</button>
          <span>·</span>
          <button onClick={() => setShowAgb(true)} className="hover:text-gray-600 transition-colors">AGB</button>
          <span>·</span>
          <button onClick={() => setShowDsgvo(true)} className="hover:text-gray-600 transition-colors">Datenschutz</button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-2">© 2026 JobFertig.de · M Corp Apps</p>
      </footer>

      {showImpressum && <ImpressumModal onClose={() => setShowImpressum(false)} />}
      {showAgb && <AgbModal onClose={() => setShowAgb(false)} />}
      {showDsgvo && <DsgvoModal onClose={() => setShowDsgvo(false)} />}
    </div>
  );
}
