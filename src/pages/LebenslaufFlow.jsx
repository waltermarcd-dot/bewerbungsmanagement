import { useState, useRef } from "react";
import { translations } from "@/lib/translations";
import { motion, AnimatePresence } from "framer-motion";
import ResumeUploader from "@/components/lebenslauf/ResumeUploader";
import EditResumeForm from "@/components/lebenslauf/EditResumeForm";
import PhotoUploader from "@/components/lebenslauf/PhotoUploader";
import PhotoIntro from "@/components/lebenslauf/PhotoIntro";
import TemplateSelector from "@/components/lebenslauf/TemplateSelector";
import GenderSelector from "@/components/lebenslauf/GenderSelector";
import FinalResult from "@/components/lebenslauf/FinalResult";
import ConfirmEdit from "@/components/lebenslauf/ConfirmEdit";
import DsgvoModal from "@/components/lebenslauf/DsgvoModal";
import AgbModal from "@/components/lebenslauf/AgbModal";
import ImpressumModal from "@/components/lebenslauf/ImpressumModal";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import JobfertigLogo from "@/components/JobfertigLogo";

const STEPS = ["landing", "photo_intro", "photo_upload", "resume_upload", "confirm_edit", "edit", "ats", "select", "result"];

// ─── ATS Step ────────────────────────────────────────────────────────────────
function AtsStep({ resumeData, onOptimized, onSkip }) {
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!jobText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { base44 } = await import("@/api/base44Client");
      const cvText = [
        resumeData?.name || "",
        resumeData?.title || "",
        resumeData?.summary || "",
        (resumeData?.experience || []).map(e => `${e.title || ""} bei ${e.company || ""}: ${e.description || ""}`).join("\n"),
        (resumeData?.skills || []).join(", "),
        (resumeData?.education || []).map(e => `${e.degree || ""} ${e.institution || ""}`).join(", "),
      ].filter(Boolean).join("\n\n");

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ein Experte für Bewerbungsoptimierung im deutschen Arbeitsmarkt (DACH).

LEBENSLAUF DES BEWERBERS:
${cvText}

STELLENANZEIGE:
${jobText}

Analysiere die Passung und antworte NUR als JSON:
{
  "matchScore": <Zahl 1-10>,
  "matchComment": "<1 Satz>",
  "missingKeywords": ["keyword1", "keyword2"],
  "optimizedSummary": "<Neu formuliertes Berufsprofil. Max 4 Sätze. Nichts erfinden.>",
  "tips": ["Tipp 1", "Tipp 2", "Tipp 3"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            matchScore: { type: "number" },
            matchComment: { type: "string" },
            missingKeywords: { type: "array", items: { type: "string" } },
            optimizedSummary: { type: "string" },
            tips: { type: "array", items: { type: "string" } },
          }
        }
      });
      setResult(res);
    } catch (e) {
      setResult({ error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    onOptimized({ ...resumeData, summary: result?.optimizedSummary || resumeData?.summary });
  };

  const scoreColor = (s) => {
    if (s >= 8) return "text-green-600";
    if (s >= 5) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#1a3a2a] flex items-center justify-center flex-shrink-0">
            <span className="text-[#f5c842] text-lg">🎯</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Stellenanzeige abgleichen</h2>
            <p className="text-gray-500 text-sm">Wir passen dein Profil auf die Stelle an</p>
          </div>
        </div>
        <textarea
          className="w-full border-2 border-gray-200 focus:border-[#1a3a2a] rounded-xl px-4 py-3 text-sm min-h-[160px] resize-none outline-none transition-colors"
          placeholder="Stellenanzeige hier einfügen..."
          value={jobText}
          onChange={e => setJobText(e.target.value)}
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleAnalyze}
            disabled={loading || !jobText.trim()}
            className="flex-1 px-6 py-3 bg-[#1a3a2a] text-white rounded-xl font-semibold hover:bg-[#2d5a3d] transition-colors disabled:opacity-40"
          >
            {loading ? "Analysiere…" : "Analysieren →"}
          </button>
          <button
            onClick={onSkip}
            className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors font-medium"
          >
            Überspringen
          </button>
        </div>
      </div>

      {result && !result.error && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className={`text-5xl font-black ${scoreColor(result.matchScore)}`}>{result.matchScore}<span className="text-2xl text-gray-400">/10</span></span>
            <p className="text-sm text-gray-600">{result.matchComment}</p>
          </div>
          {result.missingKeywords?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Fehlende Keywords:</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords.map(k => (
                  <span key={k} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-medium">{k}</span>
                ))}
              </div>
            </div>
          )}
          {result.optimizedSummary && (
            <div className="bg-[#f1f5f9] border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-[#1a3a2a] mb-1.5">✨ Optimiertes Berufsprofil:</p>
              <p className="text-sm text-gray-800 leading-relaxed">{result.optimizedSummary}</p>
            </div>
          )}
          {result.tips?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Tipps für deine Bewerbung:</p>
              <ul className="space-y-1.5">
                {result.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-[#f5c842] font-bold mt-0.5">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={handleApply}
            className="w-full px-6 py-3 bg-[#1a3a2a] text-white rounded-xl font-semibold hover:bg-[#2d5a3d] transition-colors"
          >
            Optimierung übernehmen →
          </button>
        </div>
      )}
      {result?.error && (
        <div className="bg-white rounded-2xl border border-red-200 p-4 text-sm text-red-600 text-center">
          Analyse fehlgeschlagen. Bitte versuche es erneut.
        </div>
      )}
    </div>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────
export default function Home() {
  const [step, setStep] = useState("landing");
  const [resumeData, setResumeData] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [startWithCamera, setStartWithCamera] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [gender, setGender] = useState(null);
  const [showGenderPrompt, setShowGenderPrompt] = useState(false);
  const [lang, setLang] = useState("de");
  const [showDsgvo, setShowDsgvo] = useState(false);
  const [showAgb, setShowAgb] = useState(false);
  const [showImpressum, setShowImpressum] = useState(false);
  const { user: authUser, isAuthenticated, navigateToLogin, logout } = useAuth();
  const photoRef = useRef(null);
  const t = translations[lang];

  const TEST_ACCOUNT = 'info.marc.walter@web.de';
  const isTestAccount = authUser?.email === TEST_ACCOUNT;
  const currentUser = authUser ? {
    username: authUser.email,
    unlimited: !isTestAccount && authUser.role === "admin",
    maxDownloads: authUser.role === "admin" && !isTestAccount ? null : 50,
    isTestAccount,
  } : null;

  const handlePhotoChoice = (choice) => {
    if (choice === "has_photo") { setStartWithCamera(false); setStep("photo_upload"); }
    else if (choice === "take_photo") { setStartWithCamera(true); setStep("photo_upload"); }
    else { setPhoto(null); photoRef.current = null; setStep("resume_upload"); }
  };

  const handlePhotoReady = (p) => {
    photoRef.current = p; setPhoto(p);
    if (p !== null) setStep("resume_upload");
  };

  const handleDataExtracted = async (data) => {
    setResumeData(data);
    if (data.name) {
      try {
        const { base44 } = await import("@/api/base44Client");
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `Based on the name "${data.name}", determine the likely gender. Respond with exactly one word: "male", "female", or "undetermined".`,
          response_json_schema: { type: "object", properties: { gender: { type: "string" } } }
        });
        const detectedGender = res?.gender?.toLowerCase();
        if (detectedGender === "male" || detectedGender === "female") setGender(detectedGender);
        else setShowGenderPrompt(true);
      } catch { /* ignore */ }
    }
    setStep("confirm_edit");
  };

  const handleEditConfirmed = (editedData) => { setResumeData(editedData); setStep("ats"); };
  const handleAtsOptimized = (data) => { setResumeData(data); setStep("select"); };
  const handleFinished = (result) => { setFinalResult(result); setStep("result"); };
  const handleReset = () => {
    setStep("landing"); setResumeData(null); setPhoto(null); setFinalResult(null);
    setIsExtracting(false); setShowGenderPrompt(false); setGender(null); photoRef.current = null;
  };
  const handleGenderSelected = (g) => { setGender(g); setShowGenderPrompt(false); setStep("edit"); };

  const currentStepIndex = STEPS.indexOf(step);

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
    <div className="min-h-screen bg-[#f1f5f9] font-inter">
      {/* ── Navbar ── */}
      <AppNavbar
        title="Lebenslauf-Optimierer"
        subtitle="Professionell. In Sekunden."
        icon={FileText}
        steps={[
          { id: 1, label: t.nav.step1 },
          { id: 2, label: t.nav.step2 },
          { id: 3, label: t.nav.step3 },
          { id: 4, label: t.nav.step4 },
        ]}
        currentStep={
          ["photo_intro","photo_upload"].includes(step) ? 1
          : step === "resume_upload" ? 2
          : ["confirm_edit","edit","ats","select"].includes(step) ? 3
          : step === "result" ? 4
          : 0
        }
        lang={lang}
        setLang={setLang}
        user={authUser}
        logout={logout}
      />

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">

          {/* Landing */}
          {step === "landing" && (
            <motion.div key="landing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="max-w-md mx-auto pt-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#1a3a2a] flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-[#f5c842]" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t.hero.title}</h1>
                    <p className="text-gray-500 text-sm leading-relaxed">{t.hero.subtitle}</p>
                  </div>
                  <button
                    onClick={() => setStep("photo_intro")}
                    className="w-full px-6 py-4 bg-[#1a3a2a] text-white font-semibold text-base rounded-xl hover:bg-[#2d5a3d] transition-colors shadow-sm"
                  >
                    {t.startBtn}
                  </button>
                  <div className="flex justify-center gap-3">
                    <button onClick={() => setShowDsgvo(true)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">DSGVO</button>
                    <span className="text-gray-200">·</span>
                    <button onClick={() => setShowAgb(true)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">AGB</button>
                    <span className="text-gray-200">·</span>
                    <button onClick={() => setShowImpressum(true)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Impressum</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === "photo_intro" && (
            <motion.div key="photo_intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <button onClick={() => setStep("landing")} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Zurück
              </button>
              <PhotoIntro onChoice={handlePhotoChoice} lang={lang} />
            </motion.div>
          )}

          {step === "photo_upload" && (
            <motion.div key="photo_upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <button onClick={() => setStep("photo_intro")} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Zurück
              </button>
              <PhotoUploader
                startWithCamera={startWithCamera}
                onPhotoReady={handlePhotoReady}
                onSkip={() => { setPhoto(null); photoRef.current = null; setStep("resume_upload"); }}
                lang={lang}
              />
            </motion.div>
          )}

          {step === "resume_upload" && (
            <motion.div key="resume_upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <button onClick={() => setStep("photo_intro")} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Zurück
              </button>
              <ResumeUploader
                photo={photo}
                onExtracted={handleDataExtracted}
                onExtracting={setIsExtracting}
                lang={lang}
              />
            </motion.div>
          )}

          {step === "confirm_edit" && (
            <motion.div key="confirm_edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ConfirmEdit
                data={resumeData}
                onConfirm={handleEditConfirmed}
                onSkip={() => setStep("ats")}
                lang={lang}
              />
            </motion.div>
          )}

          {step === "edit" && (
            <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {showGenderPrompt && (
                <GenderSelector
                  onSelect={handleGenderSelected}
                  onSkip={() => { setShowGenderPrompt(false); setStep("ats"); }}
                />
              )}
              <EditResumeForm
                initialData={resumeData}
                onSave={(data) => { setResumeData(data); setStep("ats"); }}
                onBack={() => setStep("confirm_edit")}
                lang={lang}
              />
            </motion.div>
          )}

          {step === "ats" && (
            <motion.div key="ats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AtsStep
                resumeData={resumeData}
                onOptimized={handleAtsOptimized}
                onSkip={() => setStep("select")}
              />
            </motion.div>
          )}

          {step === "select" && (
            <motion.div key="select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <TemplateSelector
                data={resumeData}
                photo={photo}
                gender={gender}
                user={currentUser}
                lang={lang}
                onFinished={handleFinished}
                onBack={() => setStep("edit")}
              />
            </motion.div>
          )}

          {step === "result" && (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <FinalResult
                result={finalResult}
                user={currentUser}
                lang={lang}
                onBack={() => setStep("edit")}
                onReset={handleReset}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      <footer className="mt-12 pb-8">
        <div className="max-w-5xl mx-auto px-6 flex justify-center gap-4 text-xs text-gray-400">
          <button onClick={() => setShowImpressum(true)} className="hover:text-gray-600 transition-colors">Impressum</button>
          <span>·</span>
          <button onClick={() => setShowAgb(true)} className="hover:text-gray-600 transition-colors">AGB</button>
          <span>·</span>
          <button onClick={() => setShowDsgvo(true)} className="hover:text-gray-600 transition-colors">Datenschutz</button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-2">© 2026 JobFertig.de · M Corp Apps</p>
      </footer>

      {/* Modals */}
      {showDsgvo && <DsgvoModal onClose={() => setShowDsgvo(false)} />}
      {showAgb && <AgbModal onClose={() => setShowAgb(false)} />}
      {showImpressum && <ImpressumModal onClose={() => setShowImpressum(false)} />}
    </div>
  );
}


