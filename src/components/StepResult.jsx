import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Download, Copy, RefreshCw, FileText, FileDown, Loader2, Check, Pencil } from "lucide-react";
import VoucherInput from "./VoucherInput";
import { toast } from "sonner";
import { motion } from "framer-motion";

function buildDin5008Html(cl, bodyText, today) {
  const esc = (s) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const bodyHtml = esc(bodyText).replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Liberation+Serif&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11pt;
    line-height: 1.15;
    color: #000;
    background: #fff;
  }
  .page {
    width: 21cm;
    min-height: 29.7cm;
    margin: 0 auto;
    padding-top: 2cm;
    padding-left: 2.5cm;
    padding-right: 2cm;
    padding-bottom: 2cm;
  }

  /* Absenderzeile über dem Anschriftfeld (kleine Schrift, 6pt) */
  .sender-line {
    font-size: 7pt;
    color: #000;
    border-bottom: 0.5pt solid #000;
    padding-bottom: 1mm;
    margin-bottom: 1mm;
    white-space: nowrap;
    overflow: hidden;
  }

  /* Anschriftfeld: 9 Zeilen à 4.233mm = 38mm hoch */
  .address-field {
    width: 85mm;
    height: 38mm;
    font-size: 11pt;
    line-height: 1.35;
    margin-bottom: 0;
  }
  .address-field .vermerk { height: 12mm; }
  .address-field .recipient-block { font-size: 11pt; }

  /* Informationsblock rechts (Absender-Details) – schwebt oben rechts */
  .info-block {
    float: right;
    text-align: right;
    font-size: 10pt;
    line-height: 1.5;
    margin-top: -38mm;
    width: 75mm;
  }
  .info-block .sender-name { font-size: 11pt; font-weight: bold; }

  .clearfix::after { content: ""; display: table; clear: both; }

  /* Datum: rechtsbündig, nach Anschriftfeld */
  .date-line {
    text-align: right;
    font-size: 11pt;
    margin-top: 8.46mm; /* 2 Leerzeilen */
    margin-bottom: 8.46mm;
  }

  /* Betreff: fett, 2 Leerzeilen vor und nach */
  .subject-line {
    font-size: 11pt;
    font-weight: bold;
    margin-bottom: 8.46mm;
  }

  /* Anrede */
  .salutation {
    font-size: 11pt;
    margin-bottom: 4.23mm; /* 1 Leerzeile */
  }

  /* Fließtext */
  .body-text p {
    font-size: 11pt;
    line-height: 1.35;
    margin-bottom: 4.23mm;
    text-align: left;
  }

  /* Grußformel */
  .closing {
    margin-top: 4.23mm;
    font-size: 11pt;
  }
  .signature-space { height: 25mm; }

  /* Anlage */
  .attachment {
    font-size: 11pt;
    margin-top: 0;
  }
</style>
</head>
<body>
<div class="page">

  <!-- Anschriftfeld mit schwebender Absender-Info rechts -->
  <div class="clearfix">
    <div class="address-field">
      <div class="sender-line">${esc(cl.applicantName)} · ${esc(cl.applicantStreet)} · ${esc(cl.applicantZipCity)} · ${esc(cl.applicantPhone)} · ${esc(cl.applicantEmail)}</div>
      <div class="vermerk"></div>
      <div class="recipient-block">
        ${cl.contactPerson ? `<div>${esc(cl.contactPerson)}</div>` : ""}
        <div>${esc(cl.company)}</div>
        ${cl.companyStreet ? `<div>${esc(cl.companyStreet)}</div>` : ""}
        ${cl.companyZipCity ? `<div>${esc(cl.companyZipCity)}</div>` : ""}
      </div>
    </div>

    <div class="info-block">
      <div class="sender-name">${esc(cl.applicantName)}</div>
      <div>${esc(cl.applicantStreet)}</div>
      <div>${esc(cl.applicantZipCity)}</div>
      <div>${esc(cl.applicantPhone)}</div>
      <div>${esc(cl.applicantEmail)}</div>
    </div>
  </div>

  <!-- Datum -->
  <div class="date-line">${today}</div>

  <!-- Betreff -->
  <div class="subject-line">${esc(cl.subject || `Bewerbung als ${cl.jobTitle}`)}</div>

  <!-- Anrede -->
  <div class="salutation">${esc(cl.salutation || "Sehr geehrte Damen und Herren")},</div>

  <!-- Fließtext -->
  <div class="body-text"><p>${bodyHtml}</p></div>

  <!-- Grußformel -->
  <div class="closing">
    <div>Mit freundlichen Grüßen</div>
    <div class="signature-space"></div>
    <div>${esc(cl.applicantName)}</div>
  </div>

  <!-- Anlage -->
  <div class="attachment">
    <br>Anlage: Lebenslauf
  </div>

</div>
</body>
</html>`;
}

export default function StepResult({ coverLetter, jobData, user, onBack, onRestart }) {
  const [body, setBody] = useState(coverLetter?.body || "");
  const [editing, setEditing] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [widerrufsChecked, setWiderrufsChecked] = useState(false);
  const [paidViaStripe, setPaidViaStripe] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);

  const voucherRemaining = activeVoucher ? (activeVoucher.total_downloads - activeVoucher.used_downloads) : null;
  const canDownload = paidViaStripe || (activeVoucher && voucherRemaining > 0);

  // Stripe Success serverseitig verifizieren
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (params.get('paid') === 'true' && sessionId) {
      (async () => {
        try {
          const res = await base44.functions.invoke('verifyStripeSession', {
            session_id: sessionId,
            app_type: 'anschreiben',
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
      toast.error('Ungültige Zahlungs-URL.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleStripeCheckout = async () => {
    setStripeLoading(true);
    try {
      const currentUrl = window.location.href.split('?')[0];
      const res = await base44.functions.invoke('createCheckoutSession', {
        app_type: 'anschreiben',
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

  const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
  const cl = { ...coverLetter, body };

  const fullText = () => [
    cl.applicantName,
    cl.applicantStreet,
    cl.applicantZipCity,
    cl.applicantPhone,
    cl.applicantEmail,
    "",
    "",
    today,
    "",
    "",
    cl.subject || `Bewerbung als ${cl.jobTitle}`,
    "",
    "",
    cl.salutation + ",",
    "",
    body,
    "",
    "Mit freundlichen Grüßen",
    "",
    "",
    "",
    cl.applicantName,
    "",
    "Anlage: Lebenslauf",
  ].join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText());
    setCopied(true);
    toast.success("Text kopiert!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadText = () => {
    const blob = new Blob([fullText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Anschreiben_${cl.company || "Bewerbung"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Textdatei heruntergeladen!");
  };

  const handleDownloadWord = () => {
    setExporting("word");
    const htmlContent = buildDin5008Html(cl, body, today);
    const blob = new Blob(["\ufeff" + htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Anschreiben_${cl.company || "Bewerbung"}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Word-Dokument heruntergeladen!");
    setExporting(null);
  };

  const handleDownloadPdf = async () => {
    if (!canDownload) {
      toast.error("Bitte löse zuerst einen Gutscheincode ein.");
      return;
    }
    if (!widerrufsChecked) {
      toast.error("Bitte bestätige den Widerrufsverzicht.");
      return;
    }
    setExporting("pdf");
    try {
      const htmlContent = buildDin5008Html(cl, body, today);
      const res = await base44.functions.invoke("generatePdf", { htmlContent });
      if (res.data?.file_url) {
        const a = document.createElement("a");
        a.href = res.data.file_url;
        a.download = `Anschreiben_${cl.company || "Bewerbung"}.pdf`;
        a.target = "_blank";
        a.click();
        toast.success("PDF heruntergeladen!");
        // Voucher-Counter erst nach erfolgreichem Download erhöhen
        if (activeVoucher) {
          try {
            await base44.entities.VoucherCode.update(activeVoucher.id, {
              used_downloads: activeVoucher.used_downloads + 1
            });
            setActiveVoucher(v => ({ ...v, used_downloads: v.used_downloads + 1 }));
          } catch {}
        }

        // Download-Event loggen
        try {
          await base44.entities.DownloadEvent.create({
            app_type: 'anschreiben',
            voucher_code: paidViaStripe ? 'STRIPE-DIREKT' : (activeVoucher?.code || 'intern'),
            company_name: paidViaStripe ? 'Stripe-Direktkauf' : (activeVoucher?.company_name || 'Intern'),
            downloaded_at: new Date().toISOString(),
            message: paidViaStripe ? 'Stripe-Direktkauf PDF-Download' : `Voucher: ${activeVoucher?.code}`,
          });
        } catch (_) {}

        // Benachrichtigung an Owner
        try {
          await base44.functions.invoke('notifyDownload', {
            type: 'anschreiben',
            company: paidViaStripe ? 'Stripe-Direktkauf' : (activeVoucher?.company_name || 'Direktzugang'),
            code: paidViaStripe ? 'STRIPE-DIREKT' : (activeVoucher?.code || 'unlimited'),
          });
        } catch {}
      } else {
        throw new Error(res.data?.error || "Unbekannter Fehler");
      }
    } catch (e) {
      toast.error("PDF-Export fehlgeschlagen: " + e.message);
    }
    setExporting(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Zurück
          </button>
          <h2 className="font-playfair text-3xl font-semibold text-foreground mb-2">Dein Anschreiben</h2>
          <p className="text-muted-foreground">Professionell nach DIN 5008 – bereit zum Herunterladen.</p>
        </div>
        <Button variant="outline" onClick={onRestart} className="gap-2 shrink-0">
          <RefreshCw className="w-4 h-4" /> Neu starten
        </Button>
      </div>

      {/* DIN 5008 Letter Preview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm font-inter text-sm text-black"
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        {/* Simulate DIN 5008 page */}
        <div className="p-8 md:p-12 space-y-0" style={{ fontSize: "10.5pt", lineHeight: "1.3" }}>

          {/* Absender-Zeile + Anschriftfeld + Info-Block rechts */}
          <div className="flex justify-between items-start gap-4 mb-0">
            {/* Left: Anschriftfeld */}
            <div className="w-72 shrink-0">
              {/* Absender-Kurzzeile */}
              <div className="text-xs border-b border-black pb-0.5 mb-1 whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontSize: "7pt" }}>
                {[cl.applicantName, cl.applicantStreet, cl.applicantZipCity, cl.applicantPhone, cl.applicantEmail].filter(Boolean).join(" · ")}
              </div>
              {/* Vermerkzone (3 Leerzeilen) */}
              <div style={{ height: "12mm" }} />
              {/* Empfänger */}
              <div className="space-y-0.5" style={{ lineHeight: "1.35" }}>
                {cl.contactPerson && <p>{cl.contactPerson}</p>}
                <p className="font-medium">{cl.company}</p>
                {cl.companyStreet && <p>{cl.companyStreet}</p>}
                {cl.companyZipCity && <p>{cl.companyZipCity}</p>}
              </div>
            </div>

            {/* Right: Absender-Infoblock */}
            <div className="text-right space-y-0.5 shrink-0" style={{ lineHeight: "1.5" }}>
              <p className="font-semibold">{cl.applicantName}</p>
              {cl.applicantStreet && <p>{cl.applicantStreet}</p>}
              {cl.applicantZipCity && <p>{cl.applicantZipCity}</p>}
              {cl.applicantPhone && <p>{cl.applicantPhone}</p>}
              {cl.applicantEmail && <p>{cl.applicantEmail}</p>}
            </div>
          </div>

          {/* Datum (rechtsbündig, 2 Leerzeilen nach Anschrift) */}
          <div className="text-right mt-6 mb-6">{today}</div>

          {/* Betreff (fett, 2 Leerzeilen vor + nach) */}
          <div className="font-bold mb-6">
            {cl.subject || `Bewerbung als ${cl.jobTitle || jobData?.jobTitle || ""}`}
          </div>

          {/* Anrede */}
          <div className="mb-4">{cl.salutation || "Sehr geehrte Damen und Herren"},</div>

          {/* Fließtext */}
          {editing ? (
            <Textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              className="min-h-64 resize-none text-sm leading-relaxed border-accent/30 mb-4"
              style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "10.5pt" }}
            />
          ) : (
            <div className="mb-4 space-y-3">
              {body.split(/\n\n+/).map((para, i) => (
                <p key={i} style={{ lineHeight: "1.35" }}>{para.replace(/\n/g, " ")}</p>
              ))}
            </div>
          )}

          {/* Grußformel */}
          <div className="mt-4">Mit freundlichen Grüßen</div>
          {/* Unterschriftsraum */}
          <div style={{ height: "20mm" }} />
          <div>{cl.applicantName}</div>

          {/* Anlage */}
          <div className="mt-4 text-muted-foreground" style={{ color: "#555" }}>Anlage: Lebenslauf</div>
        </div>
      </motion.div>

      {/* Voucher + Widerruf */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
        {paidViaStripe ? (
          <div className="space-y-3">
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
            <div className="border-t border-green-200 pt-2 space-y-1">
              <p className="text-xs text-green-700">✓ Dein PDF-Download ist jetzt freigeschaltet</p>
              <p className="text-xs text-green-700">✓ Klick auf den Download-Button weiter unten</p>
            </div>
            <p className="text-[10px] text-green-600 leading-relaxed">
              M Corp Apps · Marc Daniel Walter · Kleinunternehmer gem. § 19 UStG · Keine MwSt. ausgewiesen
            </p>
          </div>
        ) : activeVoucher ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-green-700">✓ Firmen-Gutschein aktiv: {activeVoucher.company_name}</span>
              <span className="text-xs text-muted-foreground">({voucherRemaining} Download{voucherRemaining !== 1 ? "s" : ""} verbleibend)</span>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
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

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setEditing(!editing)} className="gap-2">
            <Pencil className="w-4 h-4" />
            {editing ? "Vorschau" : "Bearbeiten"}
          </Button>
          <Button variant="outline" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            Kopieren
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleDownloadText} disabled={!!exporting} className="gap-2">
            <FileText className="w-4 h-4" /> .txt
          </Button>
          <Button variant="outline" onClick={handleDownloadWord} disabled={!!exporting} className="gap-2">
            {exporting === "word" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Word
          </Button>
          <Button onClick={handleDownloadPdf} disabled={!!exporting || !canDownload || !widerrufsChecked} className="gap-2">
            {exporting === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {canDownload ? "Jetzt kostenpflichtig herunterladen – 10,00 €" : "PDF (Gutschein nötig)"}
          </Button>
        </div>
      </div>
    </div>
  );
}