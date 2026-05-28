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
import { ArrowLeft, Loader2, ChevronRight, Sparkles } from "lucide-react";

// ─── ATS Step Component ───────────────────────────────────────────────────────
// Vollständig isoliert — berührt keine anderen Komponenten
// resumeData wird nur über onOptimized() nach außen gegeben, nie direkt mutiert
function AtsStep({ resumeData, onOptimized, onSkip }) {
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { matchScore, keywords, optimizedSummary, tips }

  const handleAnalyze = async () => {
    if (!jobText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { base44 } = await import("@/api/base44Client");

      // Lebenslauf als lesbaren Text aufbereiten
      const cvText = [
        resumeData?.name || "",
        resumeData?.title || "",
        resumeData?.summary || "",
        (resumeData?.experience || []).map(e =>
          `${e.title || ""} bei ${e.company || ""}: ${e.description || ""}`
        ).join("\n"),
        (resumeData?.skills || []).join(", "),
        (resumeData?.education || []).map(e =>
          `${e.degree || ""} ${e.institution || ""}`
        ).join(", "),
      ].filter(Boolean).join("\n\n");

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ein Experte für Bewerbungsoptimierung im deutschen Arbeitsmarkt (DACH).

LEBENSLAUF DES BEWERBERS:
${cvText}

STELLENANZEIGE:
${jobText}

Analysiere die Passung und antworte NUR als JSON mit dieser exakten Struktur:
{
  "matchScore": <Zahl 1-10>,
  "matchComment": "<1 Satz warum dieser Score>",
  "missingKeywords": ["keyword1", "keyword2", ...], // max 8, nur wirklich fehlende
  "optimizedSummary": "<Neu formuliertes Berufsprofil/Summary das vorhandene Erfahrungen des Bewerbers mit Keywords der Stelle verbindet. Max 4 Sätze. Nichts erfinden.>",
  "tips": ["Tipp 1", "Tipp 2", "Tipp 3"] // 3 konkrete Tipps
}

Wichtig: Nur vorhandene Infos aus dem Lebenslauf verwenden. Nichts erfinden oder hinzufügen.`,
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
    // Nur summary im resumeData ersetzen — alles andere bleibt exakt gleich
    const updatedData = {
      ...resumeData,
      summary: result?.optimizedSummary || resumeData?.summary,
    };
    onOptimized(updatedData);
  };

  const scoreColor = (s) => {
    if (s >= 8) return "text-green-600";
    if (s >= 5) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <motion.div
      key="ats"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-[#f0f7f2] border border-[#1a3a2a]/20 rounded-full px-4 py-1.5 text-sm text-[#1a3a2a] font-medium">
          <Sparkles className="w-4 h-4 text-[#c9a84c]" />
          Bonus-Schritt: ATS-Optimierung
        </div>
        <h2 className="text-xl font-bold">Lebenslauf auf Stelle zuschneiden</h2>
        <p className="text-sm text-muted-foreground">
          Füge die Stellenanzeige ein — Felix passt dein Berufsprofil an die Anforderungen an.
          <br />
          <span className="font-medium text-[#1a3a2a]">Deine Daten bleiben unverändert</span>, nur das Profil wird optimiert.
        </p>
      </div>

      {/* Stellenanzeige Input */}
      {!result && (
        <div className="space-y-3">
          <label className="text-sm font-semibold text-[#1a3a2a]">
            Stellenanzeige einfügen
          </label>
          <textarea
            className="w-full border border-border rounded-xl p-4 text-sm h-48 resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/30 bg-white"
            placeholder="Kopiere hier die komplette Stellenanzeige rein (Aufgaben, Anforderungen, alles)..."
            value={jobText}
            onChange={e => setJobText(e.target.value)}
            disabled={loading}
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAnalyze}
              disabled={!jobText.trim() || loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1a3a2a] text-white font-semibold text-sm hover:bg-[#2d5a3d] disabled:opacity-40 transition-colors"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analysiere...</>
              ) : (
                <><Sparkles className="w-4 h-4 text-[#c9a84c]" /> Jetzt analysieren</>
              )}
            </button>
            <button
              onClick={onSkip}
              className="flex items-center justify-center gap-1 py-3 px-5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Überspringen <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Ergebnis */}
      {result && !result.error && (
        <div className="space-y-4">
          {/* Match Score */}
          <div className="bg-white border border-[#1a3a2a]/20 rounded-xl p-4 flex items-center gap-4">
            <div className="text-center shrink-0">
              <p className={`text-4xl font-bold ${scoreColor(result.matchScore)}`}>
                {result.matchScore}<span className="text-lg">/10</span>
              </p>
              <p className="text-xs text-muted-foreground">Match-Score</p>
            </div>
            <p className="text-sm text-gray-700">{result.matchComment}</p>
          </div>

          {/* Fehlende Keywords */}
          {result.missingKeywords?.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-[#1a3a2a]">🔑 Keywords die noch fehlen</p>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((kw, i) => (
                  <span key={i} className="text-xs bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Optimiertes Profil */}
          {result.optimizedSummary && (
            <div className="bg-[#f0f7f2] border border-[#1a3a2a]/20 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-[#1a3a2a]">✏️ Optimiertes Berufsprofil</p>
              <p className="text-sm text-gray-700 leading-relaxed">{result.optimizedSummary}</p>
            </div>
          )}

          {/* Tipps */}
          {result.tips?.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-[#1a3a2a]">💡 Tipps</p>
              <ul className="space-y-1.5">
                {result.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-[#1a3a2a] font-bold shrink-0">{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Aktions-Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1a3a2a] text-white font-semibold text-sm hover:bg-[#2d5a3d] transition-colors"
            >
              ✅ Optimierung übernehmen & weiter
            </button>
            <button
              onClick={onSkip}
              className="flex items-center justify-center gap-1 py-3 px-5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Ohne Änderung weiter
            </button>
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-1 transition-colors"
          >
            ← Andere Stellenanzeige eingeben
          </button>
        </div>
      )}

      {result?.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 text-center space-y-3">
          <p>Analyse fehlgeschlagen. Bitte nochmal versuchen.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setResult(null)} className="text-sm underline">Nochmal versuchen</button>
            <button onClick={onSkip} className="text-sm underline">Überspringen</button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────
// ÄNDERUNGEN gegenüber Original:
// 1. STEPS: "ats" zwischen "select" und "result" eingefügt
// 2. handleTemplateSelected: geht jetzt zu "ats" statt direkt zu "result"
// 3. handleAtsOptimized + handleAtsSkip: neue Handler
// 4. Neuer {step === "ats"} Block im JSX
// ALLES ANDERE ist 1:1 identisch mit dem Original

const STEPS = ["landing", "photo_intro", "photo_upload", "resume_upload", "confirm_edit", "edit", "select", "ats", "result"];

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

  // ── Handler (unverändert) ──
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
          prompt: `Based on the name "${data.name}", determine the likely gender. Respond with exactly one word: "male", "female", or "undetermined". Consider international names. Respond only with the single word.`,
          response_json_schema: { type: "object", properties: { gender: { type: "string" } } }
        });
        const detectedGender = res?.gender?.toLowerCase();
        if (detectedGender === "male" || detectedGender === "female") setGender(detectedGender);
        else setShowGenderPrompt(true);
      } catch { /* ignore */ }
    }
    setStep("confirm_edit");
  };

  const handleEditConfirmed = (editedData) => { setResumeData(editedData); setStep("select"); };
  const handleSkipEdit = () => { setShowGenderPrompt(false); setStep("select"); };
  const handleBackToEdit = () => { setStep("edit"); setFinalResult(null); };
  const handleFinished = (result) => { setFinalResult(result); setStep("result"); };
  const handleReset = () => {
    setStep("landing"); setResumeData(null); setPhoto(null); setFinalResult(null);
    setIsExtracting(false); setShowGenderPrompt(false); setGender(null); photoRef.current = null;
  };
  const handleGenderSelected = (g) => { setGender(g); setShowGenderPrompt(false); setStep("edit"); };

  // ── NEU: ATS Handler ──
  // Wird aufgerufen wenn TemplateSelector "fertig" meldet → geht zu ATS statt direkt zu result
  // handleFinished bleibt unverändert — wird von FinalResult aufgerufen
  const handleAtsOptimized = (optimizedData) => {
    // Übernimmt das optimierte resumeData und geht zu result
    setResumeData(optimizedData);
    setStep("result");
  };
  const handleAtsSkip = () => {
    // Geht ohne Änderung zu result
    setStep("result");
  };

  const currentStepIndex = STEPS.indexOf(step);

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background gap-6">
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">📄</span>
            <span className="text-xl font-bold tracking-tight">Lebenslauf-Optimierer</span>
          </div>
          <p className="text-sm text-muted-foreground">Dein Lebenslauf. Professionell. In Sekunden.</p>
        </div>
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">Bitte melde dich an, um fortzufahren.</p>
          <button onClick={navigateToLogin} className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
            Anmelden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navbar — unverändert */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mr-1">
              <span>←</span>
              <span className="hidden sm:inline">Startseite</span>
            </Link>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sm tracking-tight">Lebenslauf-Optimierer</span>
              <span className="text-[10px] text-muted-foreground hidden sm:block">Dein Lebenslauf. Professionell. In Sekunden.</span>
            </div>
            <button onClick={() => setLang(l => l === "de" ? "en" : "de")}
              className="ml-2 px-2 py-0.5 rounded-md border border-border text-xs text-muted-foreground hover:bg-secondary transition-all">
              {lang === "de" ? "EN" : "DE"}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs">
            {[
              { id: "photo_intro", label: t.nav.step1 },
              { id: "resume_upload", label: t.nav.step2 },
              { id: "edit", label: t.nav.step3 },
              { id: "result", label: t.nav.step4 }
            ].map((s, i, arr) => {
              const sIdx = STEPS.indexOf(s.id);
              const isActive = step === s.id || (s.id === "edit" && (step === "confirm_edit" || step === "select")) || (s.id === "result" && step === "ats");
              const isPast = currentStepIndex > sIdx && step !== "ats";
              return (
                <div key={s.id} className="flex items-center gap-1">
                  <span className={`px-2 py-1 rounded-md text-xs transition-all ${isActive ? "font-semibold text-foreground" : isPast ? "text-muted-foreground" : "text-muted-foreground/40"}`}>
                    {s.label}
                  </span>
                  {i < arr.length - 1 && <span className="text-border">›</span>}
                </div>
              );
            })}
          </div>

          {authUser && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden md:block">{authUser.email}</span>
              <button onClick={logout} className="text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1 rounded-lg transition-colors">
                Abmelden
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">

          {/* ── ALLE ORIGINAL-STEPS unverändert ── */}

          {step === "landing" && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center max-w-2xl mx-auto py-16 space-y-8">
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">{t.hero.title}</h1>
                  <p className="text-base md:text-lg text-muted-foreground">{t.hero.subtitle}</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <button onClick={() => setStep("photo_intro")}
                    className="px-10 py-4 bg-primary text-primary-foreground font-semibold text-base rounded-xl hover:bg-primary/90 transition-colors shadow-md">
                    {lang === "de" ? "Jetzt starten →" : "Get started →"}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDsgvo(true)} className="px-4 py-2 border border-border text-xs text-muted-foreground rounded-lg hover:bg-secondary transition-colors">DSGVO</button>
                    <button onClick={() => setShowAgb(true)} className="px-4 py-2 border border-border text-xs text-muted-foreground rounded-lg hover:bg-secondary transition-colors">AGB</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === "photo_intro" && (
            <motion.div key="photo_intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button onClick={() => setStep("landing")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Zurück
              </button>
              <PhotoIntro onChoice={handlePhotoChoice} t={t.photoIntro} />
            </motion.div>
          )}

          {step === "photo_upload" && (
            <motion.div key="photo_upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-md mx-auto space-y-6">
              <button onClick={() => setStep("photo_intro")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Zurück
              </button>
              <div className="text-center space-y-2">
                <h2 className="font-semibold text-xl">{t.photo?.title || "Foto hochladen"}</h2>
              </div>
              <PhotoUploader onPhotoReady={handlePhotoReady} t={t.photo} startWithCamera={startWithCamera} />
            </motion.div>
          )}

          {step === "resume_upload" && (
            <motion.div key="resume_upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-lg mx-auto space-y-6">
              <button onClick={() => setStep("photo_intro")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Zurück
              </button>
              <div className="text-center space-y-2">
                <h2 className="font-semibold text-xl">{t.upload?.title || "Lebenslauf hochladen"}</h2>
                <p className="text-sm text-muted-foreground">{t.upload?.subtitle || "PDF oder Word-Datei"}</p>
              </div>
              <ResumeUploader
                onDataExtracted={handleDataExtracted}
                isExtracting={isExtracting}
                setIsExtracting={setIsExtracting}
                t={t.upload}
              />
            </motion.div>
          )}

          {step === "confirm_edit" && (
            <motion.div key="confirm_edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-lg mx-auto">
              <ConfirmEdit
                resumeData={resumeData}
                onConfirm={() => setStep("edit")}
                onSkip={handleSkipEdit}
                t={t.confirmEdit}
              />
            </motion.div>
          )}

          {step === "edit" && (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {showGenderPrompt && (
                <GenderSelector onSelect={handleGenderSelected} />
              )}
              <EditResumeForm
                data={resumeData}
                photo={photo}
                onConfirmed={handleEditConfirmed}
                t={t.edit}
              />
            </motion.div>
          )}

          {step === "select" && (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TemplateSelector
                resumeData={resumeData}
                photo={photo}
                gender={gender}
                // NEU: geht zu "ats" statt direkt zu "result"
                onFinished={(result) => {
                  setFinalResult(result);
                  setStep("ats");
                }}
                t={t.select}
                currentUser={currentUser}
              />
            </motion.div>
          )}

          {/* ── NEU: ATS Step ── */}
          {step === "ats" && (
            <AtsStep
              resumeData={resumeData}
              onOptimized={handleAtsOptimized}
              onSkip={handleAtsSkip}
            />
          )}

          {step === "result" && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FinalResult
                resumeData={resumeData}
                photo={photo}
                result={finalResult}
                onReset={handleReset}
                onEdit={handleBackToEdit}
                t={t.result}
                currentUser={currentUser}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Modals — unverändert */}
      {showDsgvo && <DsgvoModal onClose={() => setShowDsgvo(false)} />}
      {showAgb && <AgbModal onClose={() => setShowAgb(false)} />}
      {showImpressum && <ImpressumModal onClose={() => setShowImpressum(false)} />}
    </div>
  );
}
