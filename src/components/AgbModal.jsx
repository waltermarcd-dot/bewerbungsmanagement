import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

const CASUAL_TEXT = `Die Spielregeln – kurz und ehrlich

Du nutzt diese App, um deinen Lebenslauf aufzupolieren. Cool.
Hier ist, was du wissen musst:

Was wir machen:
Wir nehmen deinen Lebenslauf, jagen ihn durch eine KI
und spucken dir was Besseres aus. Kein Mensch schaut da drauf.
Nur Algorithmus. Der hat keinen schlechten Tag.

Was wir NICHT machen:
Wir garantieren dir keinen Job.
Wir versprechen nicht, dass der Chef deinen neuen Lebenslauf liebt.
Wir sind kein Karrierecoach, kein Headhunter, kein Wunder.

Dein Kram bleibt deiner:
Was du hochlädst, gehört dir. Punkt.
Wir dürfen es kurz anfassen um es zu verbessern –
danach ist es weg von unserer Seite.

Beim Foto:
Du lädst nur Fotos hoch, bei denen du das Recht dazu hast.
Also dein eigenes Gesicht. Nicht das von deiner Ex. Nicht von Promis.

Was kostet das:
Der Download kostet 10,– Euro. Einmal zahlen, einmal runterladen.
Keine Abo-Falle. Keine versteckten Kosten.
Hinweis: Wir sind Kleinunternehmer nach §19 UStG –
auf der Rechnung steht keine Mehrwertsteuer.

Widerrufsrecht:
Du zahlst, wir starten sofort mit der Erstellung.
Damit verzichtest du auf dein Widerrufsrecht – das ist gesetzlich so erlaubt
und du stimmst dem vor dem Kauf ausdrücklich zu.

KI-Hinweis:
Die Ergebnisse werden von einer KI erstellt.
Schau drüber bevor du sie abschickst. KI macht manchmal Fehler.
Wir auch übrigens – aber die KI öfter.

Wenn was schiefläuft:
Technische Probleme? Schreib uns. Wir schauen's an.
Aber für entgangene Jobangebote oder abgelehnte Bewerbungen
können wir nix. Das Leben ist halt so.`;

const LEGAL_TEXT = `# Allgemeine Geschäftsbedingungen (AGB)

**(Stand: Mai 2026)**

---

## 1. Geltungsbereich

(1) Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Web-App „Lebenslauf-Optimierer", betrieben von M Corp Apps, Marc Daniel Walter, Eurach 5, 82393 Iffeldorf (nachfolgend „Anbieter").

(2) Die App richtet sich an Verbraucher und Unternehmer im Sinne des BGB.

---

## 2. Vertragsgegenstand

(1) Der Anbieter stellt eine KI-gestützte Softwarelösung bereit, mit der Nutzer:

- bestehende Lebensläufe analysieren und optimieren können
- Bewerbungsunterlagen automatisch neu strukturieren lassen
- Bewerbungsfotos technisch verbessern (z. B. Helligkeit, Kontrast, Schärfe)
- fertige Unterlagen als PDF herunterladen können

(2) Die Leistungen erfolgen vollständig automatisiert unter Einsatz algorithmischer und KI-gestützter Verfahren.

(3) Es handelt sich ausdrücklich nicht um eine individuelle Personal- oder Karriereberatung.

---

## 3. Vertragsschluss

(1) Der Vertrag kommt durch die aktive Nutzung der kostenpflichtigen Downloadfunktion zustande.

(2) Mit Abschluss des Kaufvorgangs akzeptiert der Nutzer diese AGB.

---

## 4. Preise & Zahlung

(1) Der Download des optimierten Lebenslaufs als PDF kostet einmalig **10,00 Euro**.

(2) Der Preis wird vor dem Kaufabschluss klar und deutlich angezeigt.

(3) Der Anbieter ist Kleinunternehmer im Sinne des § 19 UStG. Es wird daher keine Umsatzsteuer berechnet und ausgewiesen.

(4) Die Zahlung erfolgt über den jeweils angebotenen Zahlungsdienstleister.

---

## 5. Widerrufsrecht & Ausschluss

(1) Verbrauchern steht grundsätzlich ein gesetzliches Widerrufsrecht zu.

(2) Bei digitalen Inhalten, die nicht auf einem Datenträger geliefert werden, erlischt das Widerrufsrecht gemäß § 356 Abs. 5 BGB, wenn der Anbieter mit der Ausführung des Vertrags begonnen hat und der Verbraucher zuvor ausdrücklich zugestimmt hat, dass der Anbieter vor Ablauf der Widerrufsfrist mit der Ausführung beginnt, und seine Kenntnis davon bestätigt hat, dass er durch seine Zustimmung mit Beginn der Ausführung des Vertrags sein Widerrufsrecht verliert.

(3) Durch Abschluss des Kaufvorgangs stimmt der Nutzer ausdrücklich zu, dass mit der Erstellung der PDF sofort begonnen wird, und bestätigt, dass er sein Widerrufsrecht damit verliert.

---

## 6. Nutzung & Pflichten des Nutzers

(1) Der Nutzer versichert, dass alle hochgeladenen Daten (Lebenslauf, Fotos etc.) rechtmäßig verwendet werden dürfen und keine Rechte Dritter verletzt werden.

(2) Bei hochgeladenen Fotos bestätigt der Nutzer ausdrücklich, dass er die abgebildete Person ist oder über die erforderlichen Nutzungsrechte verfügt.

(3) Es ist untersagt, Inhalte hochzuladen, die gegen geltendes Recht verstoßen oder beleidigend, diskriminierend oder rechtswidrig sind.

---

## 7. Nutzungsrechte

(1) Der Nutzer behält alle Rechte an den hochgeladenen Inhalten.

(2) Der Anbieter erhält ein einfaches, zeitlich auf die Verarbeitung begrenztes Nutzungsrecht zur Erbringung der Leistung.

(3) Die erstellten Ergebnisse dürfen vom Nutzer frei verwendet werden.

---

## 8. KI-Leistungen & Transparenzhinweis

(1) Die Ergebnisse werden automatisiert durch KI-Systeme erstellt und können Fehler enthalten, unvollständig oder subjektiv optimiert sein.

(2) Es wird keine Gewähr übernommen für Richtigkeit, Vollständigkeit oder Erfolg bei Bewerbungen.

(3) Der Nutzer ist verpflichtet, die Ergebnisse eigenständig zu prüfen, bevor er sie verwendet.

(4) Gemäß den Anforderungen des EU AI Act (Verordnung (EU) 2024/1689) wird darauf hingewiesen, dass die erzeugten Inhalte KI-generiert sind.

---

## 9. Verfügbarkeit

(1) Es wird eine möglichst hohe Verfügbarkeit der App angestrebt.

(2) Wartung und technische Störungen können auftreten und begründen keinen Schadensersatzanspruch.

---

## 10. Haftung

(1) Der Anbieter haftet uneingeschränkt bei Vorsatz und grober Fahrlässigkeit.

(2) Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), und zwar begrenzt auf den vertragstypisch vorhersehbaren Schaden.

(3) Keine Haftung wird übernommen für entgangene Jobchancen, abgelehnte Bewerbungen oder sonstige wirtschaftliche Schäden durch Nutzung der KI-generierten Ergebnisse.

---

## 11. Datenschutz

(1) Personenbezogene Daten werden gemäß den geltenden Datenschutzbestimmungen und der separaten Datenschutzerklärung verarbeitet.

---

## 12. Änderungen der AGB

(1) Der Anbieter behält sich vor, diese AGB mit angemessener Ankündigungsfrist zu ändern.

(2) Registrierte Nutzer werden per E-Mail über wesentliche Änderungen informiert.

---

## 13. Schlussbestimmungen

(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.

(2) Gerichtsstand ist – soweit gesetzlich zulässig – der Sitz des Anbieters.

(3) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen unberührt.`;

export default function AgbModal({ onClose }) {
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
          <h2 className="font-semibold text-base">Allgemeine Geschäftsbedingungen</h2>
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
            Schließen
          </button>
        </div>
      </motion.div>
    </div>
  );
}
