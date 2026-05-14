import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

export default function ResumeUploader({ onDataExtracted, isProcessing, setIsProcessing, t }) {
  const [fileName, setFileName] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const startTimer = () => {
    setElapsed(0);
    setProgress(0);
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    // Slowly crawl to 85% over ~45s, then stall
    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      // Eased curve: fast start, slow towards 85%
      const target = 85 * (1 - Math.exp(-elapsed / 30));
      setProgress(prev => Math.max(prev, Math.min(target, 85)));
    }, 600);
  };
  const stopTimer = () => {
    clearInterval(timerRef.current);
    clearInterval(progressRef.current);
    setProgress(100);
  };

  // PATH A: PDF upload → UploadFile + InvokeLLM (preserves original language)
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsProcessing(true);
    startTimer();

    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract the resume data from the attached PDF. IMPORTANT: Keep all text fields (descriptions, summaries, job titles, etc.) in their ORIGINAL language exactly as written in the document. Do NOT translate anything. Return the data as JSON matching the schema.`,
      file_urls: [file_url],
      response_json_schema: RESUME_SCHEMA
    });

    stopTimer();
    setIsProcessing(false);

    onDataExtracted(normalize(result || {}));
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold">{t.title}</h3>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      <div>
          {fileName ? (
            <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 rounded-xl border border-primary/20">
              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium flex-1 truncate">{fileName}</span>
              <button onClick={() => setFileName("")} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all active:bg-primary/10">
              <Upload className="w-10 h-10 text-primary" />
              <div className="text-center">
                <span className="text-sm font-semibold">{t.dropzone}</span>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOC oder DOCX</p>
              </div>
              {/* Großer sichtbarer Button für Mobile */}
              <div className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-sm pointer-events-none">
                <Upload className="w-4 h-4" /> Lebenslauf auswählen
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
        {isProcessing && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-muted-foreground text-center">Wir schauen uns deinen Lebenslauf kurz an, das kann einen kleinen Moment dauern ({elapsed}s)</p>
            <p className="text-lg font-semibold text-primary text-center">{Math.round(progress)}%</p>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div className="h-2 bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>
    </motion.div>
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