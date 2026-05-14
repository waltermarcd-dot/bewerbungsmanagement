import { X } from "lucide-react";
import { motion } from "framer-motion";

export default function ImpressumModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-base">Impressum</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 text-sm text-foreground leading-relaxed">

          <div>
            <p className="font-semibold text-base mb-1">Angaben gemäß § 5 TMG</p>
            <p>M Corp Apps</p>
            <p>Marc Daniel Walter</p>
            <p>Eurach 5</p>
            <p>82393 Iffeldorf</p>
          </div>

          <div>
            <p className="font-semibold mb-1">Kontakt</p>
            <p>E-Mail: <a href="mailto:marc_walter@hotmail.de" className="text-primary hover:underline">marc_walter@hotmail.de</a></p>
          </div>

          <div>
            <p className="font-semibold mb-1">Umsatzsteuer</p>
            <p className="text-muted-foreground">
              Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Gewerbeanmeldung</p>
            <p>Angemeldet beim zuständigen Gewerbeamt Iffeldorf am 13.05.2026.</p>
            <p>Tätigkeit: Entwicklung von Apps und Webseiten.</p>
          </div>

          <div>
            <p className="font-semibold mb-1">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</p>
            <p>Marc Daniel Walter</p>
            <p>Eurach 5, 82393 Iffeldorf</p>
          </div>

          <div>
            <p className="font-semibold mb-1">Streitschlichtung</p>
            <p className="text-muted-foreground">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="text-muted-foreground mt-1">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Haftung für Inhalte</p>
            <p className="text-muted-foreground">
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </div>

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
