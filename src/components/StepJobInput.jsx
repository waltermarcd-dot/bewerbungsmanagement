import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { Loader2, Link, FileText, ArrowRight, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";

export default function StepJobInput({ onNext }) {
  const [mode, setMode] = useState("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  // Problem 1 Fix: Robusteres URL-Fetching mit Fallback auf direkten Scrape
  const handleFetchUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      // Versuch 1: LLM mit Internet-Zugang
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ein Web-Scraper. Rufe diese URL ab und extrahiere den VOLLSTÄNDIGEN Stellenanzeigen-Text auf Deutsch: ${url}

Gib NUR den reinen Stellentext zurück (Jobtitel, Unternehmen, Aufgaben, Anforderungen, Adresse, Ansprechpartner). Kein HTML, keine Erklärungen. Wenn du die Seite nicht abrufen kannst, schreib nur: FEHLER`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
      });

      const resultText = typeof res === "string" ? res : JSON.stringify(res);

      if (resultText.trim().startsWith("FEHLER") || resultText.trim().startsWith("ERROR") || resultText.length < 50) {
        // Fallback: User auffordern Text manuell einzufügen
        toast.error("Diese Seite ist nicht direkt zugänglich. Bitte kopiere den Stellentext manuell.");
        setMode("text");
      } else {
        setText(resultText);
        setMode("text");
        toast.success("Stellenanzeige erfolgreich geladen!");
      }
    } catch (e) {
      toast.error("Fehler beim Laden. Bitte Text manuell einfügen.");
      setMode("text");
    }
    setLoading(false);
  };

  // Problem 2 Fix: Eigener Paste-Button der Clipboard API nutzt
  const handlePaste = async () => {
    try {
      // Clipboard API (funktioniert auf modernen Browsern inkl. Mobile)
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText.trim()) {
          setText(clipText);
          toast.success("Text eingefügt!");
          return;
        }
      }
      // Fallback: Focus auf Textarea setzen damit User manuell einfügen kann
      if (textareaRef.current) {
        textareaRef.current.focus();
        toast.info("Tippe lange auf das Textfeld und wähle 'Einfügen'");
      }
    } catch (e) {
      // Berechtigung verweigert — Focus-Fallback
      if (textareaRef.current) {
        textareaRef.current.focus();
        toast.info("Tippe lange auf das Textfeld und wähle 'Einfügen'");
      }
    }
  };

  const handleNext = async () => {
    const jobText = text.trim();
    if (!jobText) return;
    setLoading(true);
    try {
      const parsed = await base44.integrations.Core.InvokeLLM({
        prompt: `Analysiere diese Stellenanzeige und extrahiere ALLE Informationen sehr sorgfältig. Besonders wichtig: Extrahiere die vollständige Postanschrift des Unternehmens (Straße, PLZ, Stadt) sowie den Namen der Ansprechperson falls vorhanden. Falls keine Straßenanschrift angegeben ist, versuche sie aus dem Kontext zu erschließen.\n\n${jobText}`,
        response_json_schema: {
          type: "object",
          properties: {
            jobTitle: { type: "string" },
            company: { type: "string" },
            companyStreet: { type: "string" },
            companyZip: { type: "string" },
            companyCity: { type: "string" },
            contactPerson: { type: "string" },
            contactPersonGender: { type: "string", description: "m oder w oder unbekannt" },
            location: { type: "string" },
            keyRequirements: { type: "array", items: { type: "string" } },
            desiredSkills: { type: "array", items: { type: "string" } },
            companyValues: { type: "array", items: { type: "string" } },
          }
        }
      });
      onNext({ ...parsed, rawText: jobText });
    } catch (e) {
      toast.error("Fehler bei der Analyse");
    }
    setLoading(false);
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-1">Anschreiben-Generator</h2>
        <p className="text-sm text-muted-foreground">URL der Stellenanzeige eingeben oder Text direkt einfügen.</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-secondary rounded-xl w-fit">
        <button
          onClick={() => setMode("url")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === "url" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Link className="w-4 h-4" /> URL
        </button>
        <button
          onClick={() => setMode("text")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === "text" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <FileText className="w-4 h-4" /> Text
        </button>
      </div>

      {mode === "url" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Stellenanzeige URL</label>
            <div className="flex gap-3">
              <Input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/jobs/..."
                className="bg-card border-border flex-1 text-base"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                onKeyDown={e => e.key === "Enter" && handleFetchUrl()}
              />
              <Button onClick={handleFetchUrl} disabled={loading || !url.trim()} className="shrink-0">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Laden"}
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>⚠️ <strong>Indeed, LinkedIn & Xing</strong> blockieren automatische Zugriffe. Bitte <button onClick={() => setMode("text")} className="underline text-foreground">Text manuell einfügen</button>.</p>
            <p className="text-xs">✓ Funktioniert gut mit: Unternehmens-Websites, Stepstone, Arbeitsagentur, eigenen Karriereseiten.</p>
          </div>
        </div>
      )}

      {mode === "text" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Stellentext</label>
            {/* Expliziter Einfügen-Button für Mobile */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePaste}
              className="gap-2 text-xs h-8"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              Einfügen
            </Button>
          </div>
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Tippe auf 'Einfügen' oder füge den Stellentext hier ein…"
            className="bg-card border-border min-h-48 resize-none text-base"
            style={{ fontSize: '16px' }} // Verhindert Auto-Zoom auf iOS
          />
          {text.trim() && (
            <p className="text-xs text-green-600">✓ {text.trim().split(/\s+/).length} Wörter geladen</p>
          )}
        </div>
      )}

      {text.trim() && (
        <div className="flex justify-end">
          <Button onClick={handleNext} disabled={loading} className="gap-2 px-6">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysiere…</> : <>Weiter <ArrowRight className="w-4 h-4" /></>}
          </Button>
        </div>
      )}

      {mode === "url" && !text && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setMode("text")} className="gap-2">
            Manuell eingeben <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}