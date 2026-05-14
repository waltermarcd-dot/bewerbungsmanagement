import { useState, useRef, useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { motion } from "framer-motion";
import { RotateCcw, Download, ExternalLink, X, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PreviewWatermark from "./PreviewWatermark";
import VoucherInput from "./VoucherInput";
import CasualTemplate from "./templates/CasualTemplate";
import BusinessCasualTemplate from "./templates/BusinessCasualTemplate";
import BusinessTemplate from "./templates/BusinessTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import ModernTemplate from "./templates/ModernTemplate";
import ElegantTemplate from "./templates/ElegantTemplate";

const COMPONENTS = {
  casual: CasualTemplate,
  "business-casual": BusinessCasualTemplate,
  business: BusinessTemplate,
  minimal: MinimalTemplate,
  modern: ModernTemplate,
  elegant: ElegantTemplate,
};

const isMobileDevice = () => /android|iphone|ipad|ipod|samsung|mobile/i.test(navigator.userAgent);

function PdfReadyDialog({ pdfUrl, onClose, t }) {
  if (!pdfUrl) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-5"
      >
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-semibold text-base">Fehler beim Vorbereiten der PDF</h3>
        </div>
        <p className="text-sm text-muted-foreground">Die PDF-URL ist nicht verfügbar. Bitte erneut versuchen.</p>
        <Button variant="outline" onClick={onClose} className="w-full">Schließen</Button>
      </motion.div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">{t?.pdfReady || "PDF ist bereit"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          {t?.pdfReadyHint || "Dein Lebenslauf wurde als PDF gespeichert und kann jetzt geöffnet oder heruntergeladen werden."}
        </p>
        <div className="flex flex-col gap-2">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full h-9 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> {t?.pdfOpen || "PDF öffnen"}
          </a>
          <a
            href={pdfUrl}
            download="lebenslauf.pdf"
            className="inline-flex items-center justify-center gap-2 w-full h-9 px-4 py-2 text-sm font-medium rounded-md border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Download className="w-4 h-4" /> {t?.download || "PDF herunterladen"}
          </a>
          <Button variant="ghost" onClick={onClose} className="w-full text-muted-foreground">
            {t?.close || "Schließen"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function calcPhotoSize(data) {
  if (!data) return 'medium';
  let score = 0;
  if (data.summary) score += Math.ceil(data.summary.length / 80);
  if (data.experience) data.experience.forEach(e => { score += 3; if (e.description) score += Math.ceil(e.description.length / 80); });
  if (data.education) score += data.education.length * 2;
  if (data.skills) score += Math.ceil(data.skills.length / 3);
  if (score < 12) return 'large';
  if (score < 22) return 'medium';
  return 'small';
}

export default function FinalResult({ resumeData, photo, result, onReset, onEdit, t, currentUser }) {
  const photoSize = calcPhotoSize(resumeData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const progressRef = useRef(null);
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [widerrufsChecked, setWiderrufsChecked] = useState(false);
  const [paidViaStripe, setPaidViaStripe] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);

  const isUnlimited = currentUser?.unlimited === true;
  // With a voucher, remaining downloads come from the voucher
  const voucherRemaining = activeVoucher ? (activeVoucher.total_downloads - activeVoucher.used_downloads) : null;
  const canDownload = isUnlimited || paidViaStripe || (activeVoucher && voucherRemaining > 0);

  // Stripe Success-URL prüfen und serverseitig verifizieren
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (params.get('paid') === 'true' && sessionId) {
      (async () => {
        try {
          const res = await base44.functions.invoke('verifyStripeSession', {
            session_id: sessionId,
            app_type: 'lebenslauf',
          });
          if (res?.data?.verified) {
            setPaidViaStripe(true);
            setWiderrufsChecked(true);
            toast.success('Zahlung bestätigt! PDF-Download freigeschaltet.');
          } else {
            toast.error('Zahlung konnte nicht verifiziert werden.');
          }
        } catch (e) {
          toast.error('Fehler bei der Zahlungsverifikation.');
        }
        window.history.replaceState({}, '', window.location.pathname);
      })();
    } else if (params.get('paid') === 'true') {
      // session_id fehlt → kein Zugang
      toast.error('Ungültige Zahlungs-URL.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleStripeCheckout = async () => {
    setStripeLoading(true);
    try {
      const currentUrl = window.location.href.split('?')[0];
      const res = await base44.functions.invoke('createCheckoutSession', {
        app_type: 'lebenslauf',
        success_url: currentUrl + '?paid=true&session_id={CHECKOUT_SESSION_ID}',
        cancel_url: currentUrl + '?cancelled=true',
      });
      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Stripe-Fehler: ' + (res?.data?.error || 'Unbekannt'));
      }
    } catch (e) {
      toast.error('Fehler beim Starten der Zahlung: ' + e.message);
    }
    setStripeLoading(false);
  };

  const startProgress = (targetPct, durationMs) => {
    clearInterval(progressRef.current);
    const start = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const frac = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - frac, 2);
      setGenerateProgress(prev => Math.max(prev, Math.round(eased * targetPct)));
      if (frac >= 1) clearInterval(progressRef.current);
    }, 80);
  };

  const finishProgress = () => {
    clearInterval(progressRef.current);
    setGenerateProgress(100);
  };

  const photoToBase64 = async (url) => {
    if (!url) return null;
    if (url.startsWith('data:')) return url;
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const handleGeneratePdf = async () => {
    if (!canDownload) {
      toast.error("Bitte löse zuerst einen Gutscheincode ein oder warte auf Schritt 2 (Bezahlung).");
      return;
    }
    setIsGenerating(true);
    setGenerateProgress(0);
    setPdfUrl(null);

    try {

      // Phase 1: Foto + Template aufbereiten (~15%)
      startProgress(15, 800);
      const TemplateComp = COMPONENTS[result.styleId];
      const rawPhoto = photo?.preview;
      const photoBase64 = rawPhoto ? await photoToBase64(rawPhoto) : null;

      const bodyHtml = renderToStaticMarkup(
        <TemplateComp data={resumeData} photoUrl={photoBase64} photoSize={photoSize} />
      );

      // Phase 2: HTML zusammenstellen (~30%)
      startProgress(30, 400);

      const styleForTemplate = {
        casual: `
          html, body { background: #f0f4f8; }
          .resume-body { background: linear-gradient(to right, #f0f4f8 210px, #ffffff 210px); min-height: 100%; }
        `,
        "business-casual": `
          html, body { background: #f8fafc; }
          .resume-body { background: linear-gradient(to right, #ffffff calc(100% - 210px), #f8fafc calc(100% - 210px)); min-height: 100%; }
        `,
        business: `
          html, body { background: #ffffff; }
          .resume-body { background: #ffffff; min-height: 100%; }
        `,
        minimal: `
          html, body { background: #fafafa; }
          .resume-body { background: linear-gradient(to right, #e63946 5px, #fafafa 5px); min-height: 100%; }
        `,
        modern: `
          html, body { background: #f4f6fb; }
          .resume-body { background: #f4f6fb; min-height: 100%; }
        `,
        elegant: `
          html, body { background: #fffdf7; }
          .resume-body { background: #fffdf7; min-height: 100%; }
        `,
      }[result.styleId] || '';

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<!-- Fonts: lokal, kein Google CDN -->
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html { background: #fff; }
body { margin: 0; padding: 0; }
${styleForTemplate}
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
</style>
</head>
<body><div class="resume-body">${bodyHtml}</div></body>
</html>`;

      // Phase 3: PDF wird generiert (~90%, langsam – das dauert am längsten)
      startProgress(90, 18000);
      const response = await base44.functions.invoke('generatePdf', { htmlContent: fullHtml });
      const file_url = response?.data?.file_url;

      if (!file_url) {
        throw new Error('Keine PDF-URL erhalten.');
      }

      // Increment voucher counter
      if (!isUnlimited && activeVoucher) {
        const newUsed = activeVoucher.used_downloads + 1;
        await base44.entities.VoucherCode.update(activeVoucher.id, { used_downloads: newUsed });
        setActiveVoucher(v => ({ ...v, used_downloads: newUsed }));
      }

      // Download-Event loggen
      try {
        await base44.entities.DownloadEvent.create({
          app_type: 'lebenslauf',
          voucher_code: paidViaStripe ? 'STRIPE-DIREKT' : (activeVoucher?.code || 'intern'),
          company_name: paidViaStripe ? 'Stripe-Direktkauf' : (activeVoucher?.company_name || 'Intern'),
          downloaded_at: new Date().toISOString(),
          message: paidViaStripe ? 'Stripe-Direktkauf PDF-Download' : `Voucher: ${activeVoucher?.code}`,
        });
      } catch (_) {}

      finishProgress();
      await new Promise(r => setTimeout(r, 400));
      setPdfUrl(file_url);
      setShowDialog(true);
      toast.success('PDF wurde erstellt und ist bereit!');

      // Benachrichtigung an Owner
      try {
        await base44.functions.invoke('notifyDownload', {
          type: 'lebenslauf',
          company: activeVoucher?.company_name || 'Direktzugang',
          code: activeVoucher?.code || 'unlimited',
        });
      } catch {}

      setTimeout(() => {
        onReset();
        toast.info(t.autoDelete);
      }, 15 * 60 * 1000);

    } catch (e) {
      console.error('PDF GENERATION ERROR:', e?.message || e);
      finishProgress();
      toast.error('Fehler: ' + (e?.message || 'Unbekannter Fehler'));
      setPdfUrl(null);
      setShowDialog(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const TemplateComponent = COMPONENTS[result.styleId];
  const displayPhoto = photo?.preview;

  const leftPanel = (
    <div className="space-y-4">
      <button onClick={onEdit} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
        ← {t.backToEdit || "Zurück zur Bearbeitung"}
      </button>
    </div>
  );

  const rightPanel = (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.previewTitle}</p>
      <div className="bg-slate-50 rounded-lg p-3 sm:p-6 flex justify-center border border-border">
        {/* Mobile: breitere Vorschau */}
        <div className="sm:hidden relative overflow-hidden border border-border bg-white shadow-sm w-full" style={{ height: "380px" }}>
          <div style={{ transform: "scale(0.42)", transformOrigin: "top left", width: "794px", height: "1123px", position: "absolute", top: 0, left: 0 }}>
            <TemplateComponent data={resumeData} photoUrl={displayPhoto} photoSize={photoSize} />
          </div>
          <PreviewWatermark />
        </div>
        {/* Desktop: Original */}
        <div className="hidden sm:block relative overflow-hidden border border-border bg-white shadow-sm" style={{ width: "210px", height: "297px" }}>
          <div style={{ transform: "scale(0.265)", transformOrigin: "top left", width: "794px", height: "1123px", position: "absolute", top: 0, left: 0 }}>
            <TemplateComponent data={resumeData} photoUrl={displayPhoto} photoSize={photoSize} />
          </div>
          <PreviewWatermark />
        </div>
      </div>

      {/* Voucher / Stripe / Access */}
      {!isUnlimited && !paidViaStripe && (
        <div className="border border-border rounded-xl p-4 space-y-3 bg-card">
          {activeVoucher ? (
            <div className="space-y-1">
              <p className="text-xs font-medium text-green-700">✓ Firmen-Gutschein aktiv: {activeVoucher.company_name}</p>
              <p className="text-xs text-muted-foreground">{voucherRemaining} Download{voucherRemaining !== 1 ? "s" : ""} verbleibend</p>
            </div>
          ) : (
            <div className="space-y-3">
              <VoucherInput onRedeemed={setActiveVoucher} />
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">oder</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <Button
                onClick={handleStripeCheckout}
                disabled={stripeLoading}
                className="w-full gap-2 bg-[#635BFF] hover:bg-[#4F46E5] text-white"
              >
                {stripeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "💳"}
                {stripeLoading ? "Weiterleitung..." : "Jetzt kaufen – 10,00 €"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">Sichere Zahlung via Stripe · Sofort-Download</p>
            </div>
          )}
        </div>
      )}
      {paidViaStripe && (
        <div className="border border-green-200 rounded-2xl p-5 bg-green-50 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-green-800">Zahlung erfolgreich!</p>
              <p className="text-xs text-green-700">Betrag: 10,00 € · Sicher bezahlt via Stripe</p>
            </div>
          </div>
          <div className="border-t border-green-200 pt-3 space-y-1">
            <p className="text-xs text-green-700">✓ Dein PDF-Download ist jetzt freigeschaltet</p>
            <p className="text-xs text-green-700">✓ Klick auf den Download-Button weiter unten</p>
          </div>
          <p className="text-[10px] text-green-600 leading-relaxed">
            M Corp Apps · Marc Daniel Walter · Kleinunternehmer gem. § 19 UStG · Keine MwSt. ausgewiesen
          </p>
        </div>
      )}

      <div className="space-y-2 pt-2">
        <Button variant="ghost" onClick={onReset} size="sm" className="gap-2 w-full text-muted-foreground">
          <RotateCcw className="w-4 h-4" /> {t.restart}
        </Button>
        {isGenerating && (
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Wir bringen jetzt alles zusammen und freuen uns dir gleich deinen Lebenslauf präsentieren zu können
            </p>
            <p className="text-xl font-semibold text-primary text-center">{Math.round(generateProgress)}%</p>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="h-2 bg-primary rounded-full transition-all duration-500"
                style={{ width: `${generateProgress}%` }}
              />
            </div>
          </div>
        )}
        {!isUnlimited && (
          <div className="space-y-2">
            <label className="flex items-start gap-2 cursor-pointer group">
              <input
                type="checkbox"
                id="widerruf-checkbox"
                checked={widerrufsChecked}
                onChange={e => setWiderrufsChecked(e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <span className="text-xs text-muted-foreground leading-snug">
                Ich stimme zu, dass mit der Erstellung der PDF sofort begonnen wird und mein{" "}
                <strong>Widerrufsrecht damit erlischt</strong> (§ 356 Abs. 5 BGB).
              </span>
            </label>
          </div>
        )}
        <Button
          onClick={handleGeneratePdf}
          disabled={isGenerating || (!isUnlimited && (!activeVoucher || !widerrufsChecked))}
          className="gap-2 w-full"
        >
          <Download className="w-4 h-4" />
          {isUnlimited ? (t.download || "PDF herunterladen") : "Jetzt kostenpflichtig herunterladen – 10,00 €"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {showDialog && <PdfReadyDialog pdfUrl={pdfUrl} onClose={() => setShowDialog(false)} t={t} />}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">

        <div className="sm:hidden space-y-4">
          {leftPanel}
          {rightPanel}
        </div>

        <div className="hidden sm:grid grid-cols-2 gap-10 items-start">
          <div>{leftPanel}</div>
          <div>{rightPanel}</div>
        </div>

      </motion.div>
    </>
  );
}