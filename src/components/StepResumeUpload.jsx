import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Loader2, Upload, FileText, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function StepResumeUpload({ jobData, onBack, onNext }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [dragging, setDragging] = useState(false);
  const [isInitiative, setIsInitiative] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("Bitte nur PDF-Dateien hochladen.");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleGenerate = async () => {
    if (!file) return;
    setIsInitiative(false);
    setLoading(true);

    try {
      // 1. Upload
      setStage("uploading");
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // 2. Extract resume text via LLM
      setStage("extracting");
      const resumeData = await base44.integrations.Core.InvokeLLM({
        prompt: `Extrahiere alle wichtigen Informationen aus diesem Lebenslauf (PDF). Achte besonders auf die vollständige Adresse (Straße + Hausnummer, PLZ, Stadt getrennt). Gib alles strukturiert zurück.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            street: { type: "string", description: "Straße und Hausnummer" },
            zip: { type: "string" },
            city: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            summary: { type: "string" },
            skills: { type: "array", items: { type: "string" } },
            experience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  company: { type: "string" },
                  duration: { type: "string" },
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
            languages: { type: "array", items: { type: "string" } },
          }
        }
      });

      // 3. Analyse: Match-Score + Betreff bestimmen
      setStage("generating");

      // Determine salutation from contact person
      const contactPerson = jobData.contactPerson || "";
      const gender = jobData.contactPersonGender || "unbekannt";
      let salutation = "Sehr geehrte Damen und Herren";
      if (contactPerson) {
        const nameParts = contactPerson.trim().split(" ");
        const lastName = nameParts[nameParts.length - 1];
        if (gender === "m") salutation = `Sehr geehrter Herr ${lastName}`;
        else if (gender === "w") salutation = `Sehr geehrte Frau ${lastName}`;
        else salutation = `Sehr geehrte/r ${contactPerson}`;
      }

      // Schritt 3a: Nur Match-Score + Betreff + Initiative-Flag bestimmen
      const matchResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Vergleiche diesen Lebenslauf mit der Stellenanzeige und bewerte die Übereinstimmung.

LEBENSLAUF:
${JSON.stringify(resumeData, null, 2)}

STELLENANZEIGE:
Unternehmen: ${jobData.company || "Unbekannt"}
Position: ${jobData.jobTitle || "Unbekannt"}
Anforderungen: ${(jobData.keyRequirements || []).join(", ")}
Stellentext: ${jobData.rawText || ""}

Gib zurück:
- match_score: Zahl von 0 bis 100, wie gut der Lebenslauf zur Stelle passt
- is_initiative: true wenn match_score unter 40, sonst false
- subject: passender Betreff für das Anschreiben (ohne "Betreff:")`,
        response_json_schema: {
          type: "object",
          properties: {
            match_score: { type: "number" },
            is_initiative: { type: "boolean" },
            subject: { type: "string" },
          }
        }
      });

      const isInitiativeFlag = matchResult.is_initiative === true;
      setIsInitiative(isInitiativeFlag);

      // Schritt 3b: Fließtext generieren (separate Aufgabe)
      const bodyResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ein erfahrener Karriereberater. Schreibe den Fließtext für ein deutsches Bewerbungsanschreiben.

BEWERBER:
${JSON.stringify(resumeData, null, 2)}

STELLE:
Unternehmen: ${jobData.company || "Unbekannt"}
Position: ${jobData.jobTitle || "Unbekannt"}
Anforderungen: ${(jobData.keyRequirements || []).join(", ")}
Stellentext: ${jobData.rawText || ""}

${isInitiativeFlag
  ? "Dies ist eine INITIATIVBEWERBUNG (der Lebenslauf passt kaum zur Stelle). Fokussiere auf allgemeine Stärken des Bewerbers und sein Interesse am Unternehmen."
  : "Schreibe ein maßgeschneidertes Anschreiben, das die Erfahrungen des Bewerbers mit den Anforderungen der Stelle verknüpft."
}

REGELN:
- NUR den Fließtext ausgeben – keine Anrede, keine Grußformel, keine Betreffzeile
- 3 Absätze durch Leerzeile getrennt: (1) Einstieg & Motivation, (2) Kernkompetenzen, (3) Gesprächswunsch
- Fließender, narrativer Stil – keine Floskeln wie "teamfähig" oder "belastbar"
- Selbstbewusster, aktiver Ton
- Ca. 250–300 Wörter

Gib NUR den reinen Text zurück, ohne JSON-Wrapper.`,
        response_json_schema: {
          type: "object",
          properties: {
            body: { type: "string", description: "Der vollständige Fließtext des Anschreibens" }
          }
        }
      });

      const letter = {
        match_score: matchResult.match_score,
        is_initiative: isInitiativeFlag,
        subject: matchResult.subject,
        body: bodyResult?.body || "",
      };

      const applicantName = resumeData.name || `${resumeData.firstName || ""} ${resumeData.lastName || ""}`.trim();
      const applicantStreet = resumeData.street || "";
      const applicantZipCity = [resumeData.zip, resumeData.city].filter(Boolean).join(" ");

      onNext({
        subject: letter.subject,
        body: letter.body,
        salutation,
        applicantName,
        applicantStreet,
        applicantZipCity,
        applicantEmail: resumeData.email || "",
        applicantPhone: resumeData.phone || "",
        company: jobData.company || "",
        companyStreet: jobData.companyStreet || "",
        companyZipCity: [jobData.companyZip, jobData.companyCity].filter(Boolean).join(" "),
        contactPerson: jobData.contactPerson || "",
        jobTitle: jobData.jobTitle || "",
        resumeData,
        isInitiative: letter.is_initiative === true,
        matchScore: letter.match_score,
      });
    } catch (e) {
      toast.error("Fehler: " + e.message);
    }
    setLoading(false);
    setStage("");
  };

  const stageLabel = {
    uploading: "Lebenslauf wird hochgeladen…",
    extracting: "Lebenslauf wird analysiert…",
    generating: "Anschreiben wird generiert…",
  }[stage] || "";

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 space-y-8">
      <div>
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-1">Lebenslauf hochladen</h2>
        <p className="text-sm text-muted-foreground">Lade deinen Lebenslauf als PDF hoch. Die KI vergleicht ihn mit der Stelle und erstellt das perfekte Anschreiben.</p>
      </div>

      {/* Job Summary */}
      {jobData && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ausgewählte Stelle</p>
          <p className="font-semibold text-foreground">{jobData.jobTitle || "Unbekannte Position"}</p>
          {jobData.company && <p className="text-sm text-muted-foreground">{jobData.company}</p>}
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
          dragging ? "border-accent bg-accent/10" :
          file ? "border-green-400 bg-green-50" :
          "border-border hover:border-accent/50 hover:bg-secondary/50"
        }`}
      >
        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        {file ? (
          <>
            <CheckCircle className="w-12 h-12 text-green-500" />
            <div className="text-center">
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); setFile(null); }}>
              Andere Datei wählen
            </Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">PDF hierher ziehen</p>
              <p className="text-sm text-muted-foreground">oder klicken zum Auswählen</p>
            </div>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" /> Datei auswählen
            </Button>
          </>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6 flex items-center gap-4"
        >
          <Loader2 className="w-6 h-6 animate-spin text-accent-foreground shrink-0" />
          <div>
            <p className="font-medium text-foreground">{stageLabel}</p>
            <p className="text-sm text-muted-foreground">Bitte warte einen Moment…</p>
          </div>
        </motion.div>
      )}

      {isInitiative && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Wenig Übereinstimmung gefunden</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Dein Lebenslauf passt nur teilweise zur ausgeschriebenen Stelle. Wir haben daher eine <strong>Initiativbewerbung</strong> erstellt, die deine allgemeinen Stärken und dein Interesse am Unternehmen hervorhebt. Du kannst den Text im nächsten Schritt noch anpassen.
            </p>
          </div>
        </motion.div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleGenerate} disabled={!file || loading} className="gap-2 px-6">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          Anschreiben generieren
        </Button>
      </div>
    </div>
  );
}