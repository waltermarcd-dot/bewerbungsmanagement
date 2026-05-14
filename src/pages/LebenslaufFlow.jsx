import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Camera, Download, ArrowLeft } from "lucide-react";
import ImpressumModal from "../components/ImpressumModal";
import AgbModal from "../components/AgbModal";
import DsgvoModal from "../components/DsgvoModal";
import ResumeUploader from "../components/ResumeUploader";
import PhotoIntro from "../components/PhotoIntro";
import PhotoUploader from "../components/PhotoUploader";
import TemplateSelector from "../components/TemplateSelector";
import EditResumeForm from "../components/EditResumeForm";
import FinalResult from "../components/FinalResult";

const STEPS = [
  { id: 1, label: "Lebenslauf", icon: FileText },
  { id: 2, label: "Foto", icon: Camera },
  { id: 3, label: "Ergebnis", icon: Download },
];

export default function LebenslaufFlow() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [resumeData, setResumeData] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoSize, setPhotoSize] = useState(100);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [showImpressum, setShowImpressum] = useState(false);
  const [showAgb, setShowAgb] = useState(false);
  const [showDsgvo, setShowDsgvo] = useState(false);
  const [showPhotoIntro, setShowPhotoIntro] = useState(false);
  const [showPhotoUploader, setShowPhotoUploader] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  return (
    <div className="min-h-screen bg-background font-display flex flex-col">

      {/* Header */}
      <header className="border-b border-border bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Zurück</span>
            </button>
            <span className="text-lg">📄</span>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sm tracking-tight">Lebenslauf-Optimierer</span>
              <span className="text-[10px] text-muted-foreground hidden sm:block">Dein Lebenslauf. Professionell. In Sekunden.</span>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const active = step === s.id;
              const done = step > s.id;
              return (
                <div key={s.id} className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    active ? "bg-primary text-primary-foreground shadow-sm" :
                    done ? "bg-primary/20 text-primary" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {s.id}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline transition-all ${
                    active ? "text-foreground" :
                    done ? "text-muted-foreground" :
                    "text-muted-foreground/40"
                  }`}>{s.label}</span>
                  {i < STEPS.length - 1 && (
                    <div className={`w-6 h-px mx-1 transition-all ${done ? "bg-primary/40" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {user && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden md:block">{user.email}</span>
              <button onClick={logout} className="text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1 rounded-lg transition-colors">
                Abmelden
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-10 pb-16">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <ResumeUploader
                onParsed={(data) => { setResumeData(data); setStep(2); }}
                onShowPhotoIntro={() => setShowPhotoIntro(true)}
              />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <PhotoUploader
                photoUrl={photoUrl}
                onPhotoUploaded={(url) => setPhotoUrl(url)}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <FinalResult
                resumeData={resumeData}
                photoUrl={photoUrl}
                photoSize={photoSize}
                selectedTemplate={selectedTemplate}
                onBack={() => setStep(2)}
                onRestart={() => { setStep(1); setResumeData(null); setPhotoUrl(null); }}
                onShowTemplateSelector={() => setShowTemplateSelector(true)}
                onShowEditForm={() => setShowEditForm(true)}
                onPhotoSizeChange={setPhotoSize}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="max-w-4xl mx-auto px-6 flex justify-center gap-4 text-xs text-muted-foreground">
          <button onClick={() => setShowImpressum(true)} className="hover:text-foreground transition-colors">Impressum</button>
          <span>·</span>
          <button onClick={() => setShowAgb(true)} className="hover:text-foreground transition-colors">AGB</button>
          <span>·</span>
          <button onClick={() => setShowDsgvo(true)} className="hover:text-foreground transition-colors">Datenschutz</button>
        </div>
      </footer>

      {showPhotoIntro && <PhotoIntro onClose={() => setShowPhotoIntro(false)} />}
      {showPhotoUploader && <PhotoUploader onClose={() => setShowPhotoUploader(false)} onPhotoUploaded={(url) => { setPhotoUrl(url); setShowPhotoUploader(false); }} />}
      {showTemplateSelector && <TemplateSelector selected={selectedTemplate} onSelect={(t) => { setSelectedTemplate(t); setShowTemplateSelector(false); }} onClose={() => setShowTemplateSelector(false)} />}
      {showEditForm && <EditResumeForm data={resumeData} onSave={(d) => { setResumeData(d); setShowEditForm(false); }} onClose={() => setShowEditForm(false)} />}
      {showImpressum && <ImpressumModal onClose={() => setShowImpressum(false)} />}
      {showAgb && <AgbModal onClose={() => setShowAgb(false)} />}
      {showDsgvo && <DsgvoModal onClose={() => setShowDsgvo(false)} />}
    </div>
  );
}
