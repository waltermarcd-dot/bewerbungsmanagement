import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

const CASUAL_TEXT = `Datenschutz, aber jetzt mal ehrlich

Pass auf:
Du lädst hier deinen Lebenslauf hoch. Vielleicht auch ein Foto.
Wir nehmen das, gucken da kurz drauf - mit so 'ner KI, die schlauer ist als ich -
und machen daraus was Vernuenftiges.
So.

Jetzt wichtig: Wir speichern den Kram nicht.
Also wirklich nicht.
Kein "wir heben das mal fuer spaeter auf" - nix da.
Du kriegst deine neuen Lebenslaeufe, kannst die runterladen,
und dann ist das Ding weg.
Geloescht. Feierabend.

Auch dein Foto - wir machen das nur bisschen huebscher.
Nicht Gesicht scannen, nicht FBI spielen.
Einfach nur: besser aussehen.

Wenn du bezahlst, laeuft das ueber den Zahlungsdienstleister.
Die kennen wir alle, die machen ihr eigenes Datenschutz-Ding.

Und deine Rechte? Hast du natuerlich. Ist Gesetz.
Kannste nachfragen, loeschen lassen, beschweren - alles dabei.
Aber nochmal: Wir haben danach eh nix mehr von dir.

Also entspann dich.`;

const LEGAL_TEXT = `# Datenschutzerklärung

**(Stand: Mai 2026)**

---

## 1. Verantwortlicher

Verantwortlich für die Datenverarbeitung im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:

**M Corp Apps**
Marc Daniel Walter
Eurach 5
82393 Iffeldorf
E-Mail: marc_walter@hotmail.de

---

## 2. Art und Zweck der Verarbeitung

Bei der Nutzung unserer App verarbeiten wir personenbezogene Daten ausschließlich zum Zweck der Erstellung und Optimierung von Bewerbungsunterlagen.

Dabei können insbesondere folgende Daten verarbeitet werden:

- Inhalte aus Lebensläufen
- Angaben zu Ausbildung, Berufserfahrung und Qualifikationen
- Kontaktdaten, sofern angegeben
- hochgeladene Dokumente
- Bewerbungsfotos

Die Verarbeitung erfolgt ausschließlich zur Bereitstellung der von Ihnen gewünschten Funktionen der App.

Rechtsgrundlage der Verarbeitung ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).

---

## 3. Temporäre Verarbeitung ohne dauerhafte Speicherung

Die Verarbeitung Ihrer Daten erfolgt ausschließlich während der aktiven Nutzung der App.

Eine dauerhafte Speicherung personenbezogener Daten findet nicht statt. Nach Abschluss der Verarbeitung werden sämtliche personenbezogenen Daten unverzüglich gelöscht. Eine Wiederherstellung ist nicht möglich.

---

## 4. Einsatz von künstlicher Intelligenz (KI)

Zur Erstellung und Optimierung Ihrer Bewerbungsunterlagen setzen wir automatisierte Verfahren auf Basis künstlicher Intelligenz ein.

Die durch die KI erzeugten Inhalte dienen ausschließlich als Unterstützung und unverbindliche Vorschläge. Es erfolgt keine ausschließlich automatisierte Entscheidungsfindung im Sinne des Art. 22 DSGVO mit rechtlicher Wirkung.

Gemäß EU AI Act (Verordnung (EU) 2024/1689) weisen wir darauf hin, dass die erzeugten Inhalte KI-generiert sind.

---

## 5. Verarbeitung von Bewerbungsfotos

Hochgeladene Bewerbungsfotos werden ausschließlich zur optischen Verbesserung verarbeitet. Eine Verarbeitung zur Identifizierung von Personen oder zur Analyse biometrischer Merkmale erfolgt nicht.

---

## 6. Einsatz externer Dienstleister

Zur technischen Bereitstellung unserer Dienste nutzen wir externe Dienstleister (insbesondere Hosting- und Verarbeitungsdienstleister). Diese verarbeiten personenbezogene Daten ausschließlich in unserem Auftrag gemäß Art. 28 DSGVO.

---

## 7. Datenübermittlung in Drittländer

Sofern Dienstleister außerhalb der EU/des EWR eingesetzt werden, erfolgt die Übermittlung ausschließlich unter Einhaltung der Art. 44 ff. DSGVO, insbesondere durch Standardvertragsklauseln der Europäischen Kommission.

---

## 8. Zahlungsabwicklung

Für kostenpflichtige Downloads wird ein Zahlungsdienstleister eingesetzt. Im Rahmen des Zahlungsvorgangs werden die erforderlichen Daten an diesen übermittelt. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.

---

## 9. Rechte der betroffenen Personen

Sie haben jederzeit folgende Rechte:

- Recht auf Auskunft (Art. 15 DSGVO)
- Recht auf Berichtigung (Art. 16 DSGVO)
- Recht auf Löschung (Art. 17 DSGVO)
- Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)
- Recht auf Datenübertragbarkeit (Art. 20 DSGVO)
- Recht auf Widerspruch (Art. 21 DSGVO)
- Recht auf Beschwerde bei einer Datenschutzaufsichtsbehörde

Für Anfragen wenden Sie sich bitte an: marc_walter@hotmail.de

---

## 10. Datensicherheit

Wir treffen geeignete technische und organisatorische Maßnahmen zum Schutz personenbezogener Daten gemäß Art. 32 DSGVO.

---

## 11. Änderungen dieser Datenschutzerklärung

Wir behalten uns vor, diese Datenschutzerklärung bei rechtlichen, technischen oder organisatorischen Änderungen anzupassen.`;

export default function DsgvoModal({ onClose }) {
  const [showLegal, setShowLegal] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-base">DSGVO &amp; Datenschutz</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab toggle */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setShowLegal(false)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${!showLegal ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Auf Deutsch
          </button>
          <button
            onClick={() => setShowLegal(true)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${showLegal ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Für Juristen
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <AnimatePresence mode="wait">
            {!showLegal ? (
              <motion.pre
                key="casual"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed"
              >
                {CASUAL_TEXT}
              </motion.pre>
            ) : (
              <motion.div
                key="legal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="prose prose-sm prose-slate max-w-none"
              >
                <ReactMarkdown>{LEGAL_TEXT}</ReactMarkdown>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Alles klar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
