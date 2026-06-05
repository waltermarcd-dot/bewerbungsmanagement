import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, X, PenLine, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const RESUME_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    email: { type: "string" },
    phone: { type: "string" },
    summary: { type: "string" },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          company: { type: "string" },
          start: { type: "string" },
          end: { type: "string" },
          description: { type: "string" }
        }
      }
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          degree: { type: "string" },
          institution: { type: "string" },
          year: { type: "string" }
        }
      }
    },
    skills: { type: "array", items: { type: "string" } }
  }
};

const EXAMPLE_PROMPT = `Beispiel:

Ich heiße Anna Müller, bin 28 Jahre alt und wohne in München.
Ich habe 2018 meinen Bachelor in BWL an der LMU abgeschlossen.

Seit 2020 arbeite ich als Projektmanagerin bei der Siemens AG. Dort bin ich für die Koordination internationaler Projekte zuständig.

Davor habe ich 2 Jahre als Werkstudentin bei einem Start-up in der Marketingabteilung gearbeitet.

Meine Stärken sind: Excel, PowerPoint, Englisch (C1), Französisch (B2), Teamarbeit.`;

export default function ResumeUploader({ photo, onExtracted, onExtracting, lang }) {
  const [mode, setMode] = useState("upload"); // "upload" | "freetext"
  const [fileName, setFileName] = useState("");
  const [freeText, setFreeText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const startTimer = () => {
    setElapsed(0);
    setProgress(0);
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const secs = (Date.now() - startTime) / 1000;
      const target = 85 * (1 - Math.exp(-secs / 30));
      setProgress(prev => Math.max(prev, Math.min(target, 85)));
    }, 600);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    clearInterval(progressRef.current);
    setProgress(100);
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsProcessing(true);
    onExtracting(true);
    startTimer();

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract the resume data from the attached PDF. IMPORTANT: Keep all text fields in their ORIGINAL language exactly as written. Do NOT translate anything. Return the data as JSON matching the schema.`,
        file_urls: [file_url],
        response_json_schema: RESUME_SCHEMA
      });
      stopTimer();
      onExtracted(normalize(result || {}));
    } finally {
      setIsProcessing(false);
      onExtracting(false);
    }
  };

  const handleFreeTextSubmit = async () => {
    if (!freeText.trim() || freeText.trim().length < 30) return;
    setIsProcessing(true);
    onExtracting(true);
    startTimer();

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Du erhältst einen freien Text einer Person über ihren beruflichen Werdegang. 
Extrahiere daraus ein strukturiertes Lebenslauf-Objekt.
WICHTIG: Behalte die Sprache des Textes exakt bei. Übersetze NICHTS.
Wenn Informationen fehlen (z.B. E-Mail oder Telefon), lass das Feld leer.
Für die "summary": Formuliere einen professionellen 2-3 Sätze Kurzprofil basierend auf dem Text.
Für "experience.description": Formuliere 2-3 prägnante Bullet-Points der Aufgaben.

Text der Person:
${freeText}`,
        response_json_schema: RESUME_SCHEMA
      });
      stopTimer();
      onExtracted(normalize(result || {}));
    } finally {
      setIsProcessing(false);
      onExtracting(false);
    }
  };

  const charCount = freeText.trim().length;
  const isReady = charCount >= 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
    >
      {/* Tab-Leiste */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setMode("upload")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all ${
            mode === "upload"
              ? "text-[#1a3a2a] border-b-2 border-[#1a3a2a] bg-[#1a3a2a]/5"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <FileText className="w-4 h-4" />
          PDF hochladen
        </button>
        <button
          onClick={() => setMode("freetext")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all ${
            mode === "freetext"
              ? "text-[#1a3a2a] border-b-2 border-[#1a3a2a] bg-[#1a3a2a]/5"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <PenLine className="w-4 h-4" />
          Von mir erzählen
        </button>
      </div>

      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">

          {/* ── Tab: PDF Upload ── */}
          {mode === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <p className="text-sm text-gray-500 mb-5">
                Lade deinen bestehenden Lebenslauf hoch — wir lesen ihn automatisch aus und optimieren ihn für dich.
              </p>

              {!isProcessing && (
                <>
                  {fileName ? (
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#1a3a2a]/5 rounded-xl border border-[#1a3a2a]/20">
                      <FileText className="w-4 h-4 text-[#1a3a2a] flex-shrink-0" />
                      <span className="text-sm font-medium flex-1 truncate">{fileName}</span>
                      <button onClick={() => setFileName("")} className="text-gray-400 hover:text-gray-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-3 px-6 py-10 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#1a3a2a]/40 hover:bg-[#1a3a2a]/5 transition-all">
                      <Upload className="w-10 h-10 text-[#1a3a2a]/50" />
                      <div className="text-center">
                        <span className="text-sm font-semibold text-gray-700">Lebenslauf auswählen</span>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOC oder DOCX</p>
                      </div>
                      <div className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a3a2a] text-white rounded-lg text-sm font-medium shadow-sm pointer-events-none">
                        <Upload className="w-4 h-4" /> Datei auswählen
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handlePdfUpload}
                        disabled={isProcessing}
                        className="hidden"
                      />
                    </label>
                  )}
                </>
              )}

              {isProcessing && <ProgressUI elapsed={elapsed} progress={progress} label="Lebenslauf wird ausgelesen…" />}
            </motion.div>
          )}

          {/* ── Tab: Freitext ── */}
          {mode === "freetext" && (
            <motion.div
              key="freetext"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <p className="text-sm text-gray-500 mb-1">
                Kein Lebenslauf zur Hand? Kein Problem — erzähl uns einfach in eigenen Worten von dir.
              </p>
              <p className="text-xs text-gray-400 mb-5">
                Was hast du gelernt? Wo hast du gearbeitet? Was kannst du gut?
              </p>

              {!isProcessing && (
                <>
                  <textarea
                    value={freeText}
                    onChange={e => setFreeText(e.target.value)}
                    placeholder={EXAMPLE_PROMPT}
                    rows={10}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/30 focus:border-[#1a3a2a]/40 resize-none transition-all"
                  />

                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-xs transition-colors ${
                      isReady ? "text-[#1a3a2a]" : "text-gray-300"
                    }`}>
                      {charCount < 30
                        ? `Noch ${30 - charCount} Zeichen mehr…`
                        : `${charCount} Zeichen ✓`
                      }
                    </span>

                    <button
                      onClick={handleFreeTextSubmit}
                      disabled={!isReady}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                        isReady
                          ? "bg-[#1a3a2a] text-white hover:bg-[#2d5a3d] cursor-pointer"
                          : "bg-gray-100 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <PenLine className="w-4 h-4" />
                      Lebenslauf erstellen
                    </button>
                  </div>
                </>
              )}

              {isProcessing && <ProgressUI elapsed={elapsed} progress={progress} label="Wir strukturieren deinen Lebenslauf…" />}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ProgressUI({ elapsed, progress, label }) {
  return (
    <div className="py-8 space-y-4 text-center">
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-2xl bg-[#1a3a2a] flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-[#f5c842] animate-spin" />
        </div>
      </div>
      <p className="text-sm text-gray-500">{label} ({elapsed}s)</p>
      <p className="text-2xl font-bold text-[#1a3a2a]">{Math.round(progress)}%</p>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden max-w-xs mx-auto">
        <div
          className="h-2 bg-[#1a3a2a] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-center gap-1.5 mt-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#1a3a2a]/30 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

function normalize(data) {
  return {
    name: data?.name || "",
    email: data?.email || "",
    phone: data?.phone || "",
    summary: data?.summary || "",
    experience: (data?.experience || []).map(e => ({
      title: e.title || "",
      company: e.company || "",
      start: e.start || "",
      end: e.end || "",
      description: e.description || ""
    })),
    education: (data?.education || []).map(e => ({
      degree: e.degree || "",
      institution: e.institution || "",
      year: e.year || ""
    })),
    skills: data?.skills || []
  };
}
