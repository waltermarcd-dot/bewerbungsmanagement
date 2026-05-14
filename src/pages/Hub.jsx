import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, PenLine, ChevronRight, Star, Shield, Zap } from "lucide-react";
import ImpressumModal from "../components/ImpressumModal";
import AgbModal from "../components/AgbModal";
import DsgvoModal from "../components/DsgvoModal";

export default function Hub() {
  const navigate = useNavigate();
  const [showImpressum, setShowImpressum] = useState(false);
  const [showAgb, setShowAgb] = useState(false);
  const [showDsgvo, setShowDsgvo] = useState(false);

  return (
    <div className="min-h-screen bg-background font-display flex flex-col">

      {/* Header */}
      <header className="border-b border-border bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💼</span>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-base tracking-tight">Bewerbungsmanagement</span>
              <span className="text-[10px] text-muted-foreground hidden sm:block">
                Deine Bewerbung. Professionell. In Minuten.
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">M Corp Apps · DSGVO-konform</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
            Was möchtest du heute tun?
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Wähle einfach aus — wir führen dich Schritt für Schritt durch den Prozess.
          </p>
        </motion.div>

        {/* Karten */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">

          {/* Lebenslauf */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => navigate("/lebenslauf")}
            className="group relative bg-white border-2 border-border hover:border-primary rounded-2xl p-8 text-left shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Lebenslauf verbessern
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Lade deinen vorhandenen Lebenslauf hoch — wir optimieren ihn mit KI und erstellen ein professionelles PDF.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-xs bg-primary/8 text-primary px-2.5 py-1 rounded-full font-medium">
                <Zap className="w-3 h-3" /> KI-Optimierung
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-accent/10 text-accent-foreground px-2.5 py-1 rounded-full font-medium">
                3 Design-Templates
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full font-medium">
                PDF-Download
              </span>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">10,00 €</span>
              <span className="text-xs text-muted-foreground">oder Gutscheincode</span>
            </div>
          </motion.button>

          {/* Anschreiben */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => navigate("/anschreiben")}
            className="group relative bg-white border-2 border-border hover:border-primary rounded-2xl p-8 text-left shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-accent/15 rounded-xl flex items-center justify-center group-hover:bg-accent/25 transition-colors">
                <PenLine className="w-7 h-7 text-accent" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Anschreiben erstellen
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Gib die Stellenanzeige ein und lade deinen Lebenslauf hoch — wir erstellen ein maßgeschneidertes Anschreiben.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-xs bg-primary/8 text-primary px-2.5 py-1 rounded-full font-medium">
                <Zap className="w-3 h-3" /> KI-generiert
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-accent/10 text-accent-foreground px-2.5 py-1 rounded-full font-medium">
                Auf Stelle zugeschnitten
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full font-medium">
                PDF / Word
              </span>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">10,00 €</span>
              <span className="text-xs text-muted-foreground">oder Gutscheincode</span>
            </div>
          </motion.button>
        </div>

        {/* Vertrauens-Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 mt-12 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-primary/60" />
            <span>DSGVO-konform</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-accent/80" />
            <span>Entwickelt in Deutschland</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-primary/60" />
            <span>KI nach EU AI Act</span>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="max-w-4xl mx-auto px-6 flex justify-center gap-4 text-xs text-muted-foreground">
          <button onClick={() => setShowImpressum(true)} className="hover:text-foreground transition-colors">Impressum</button>
          <span>·</span>
          <button onClick={() => setShowAgb(true)} className="hover:text-foreground transition-colors">AGB</button>
          <span>·</span>
          <button onClick={() => setShowDsgvo(true)} className="hover:text-foreground transition-colors">Datenschutz</button>
          <span>·</span>
          <span>© 2026 M Corp Apps</span>
        </div>
      </footer>

      {showImpressum && <ImpressumModal onClose={() => setShowImpressum(false)} />}
      {showAgb && <AgbModal onClose={() => setShowAgb(false)} />}
      {showDsgvo && <DsgvoModal onClose={() => setShowDsgvo(false)} />}
    </div>
  );
}
