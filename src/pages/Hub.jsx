import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, PenLine, ChevronRight, Star, Shield, Zap, LayoutDashboard } from "lucide-react";
import ImpressumModal from "../components/ImpressumModal";
import AgbModal from "../components/AgbModal";
import DsgvoModal from "../components/DsgvoModal";
import AppNavbar from "../components/AppNavbar";
import { useAuth } from "@/lib/AuthContext";

export default function Hub() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showImpressum, setShowImpressum] = useState(false);
  const [showAgb, setShowAgb] = useState(false);
  const [showDsgvo, setShowDsgvo] = useState(false);

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-inter flex flex-col">

      {/* ── Einheitliche Navbar ── */}
      <AppNavbar
        title="JobFertig"
        subtitle="Deine Bewerbung. Professionell. In Minuten."
        icon={LayoutDashboard}
        showBack={false}
        user={user}
        logout={logout}
      />

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Was möchtest du heute tun?
          </h1>
          <p className="text-gray-500 text-base sm:text-lg">
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
            className="group relative bg-white border-2 border-gray-100 hover:border-[#1a3a2a] rounded-2xl p-8 text-left shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-[#1a3a2a]/10 rounded-xl flex items-center justify-center group-hover:bg-[#1a3a2a]/20 transition-colors">
                <FileText className="w-7 h-7 text-[#1a3a2a]" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#1a3a2a] group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Lebenslauf verbessern
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Lade deinen vorhandenen Lebenslauf hoch — wir optimieren ihn und erstellen ein professionelles PDF.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-xs bg-[#1a3a2a]/8 text-[#1a3a2a] px-2.5 py-1 rounded-full font-medium">
                <Zap className="w-3 h-3" /> KI-Optimierung
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-[#c9a84c]/10 text-[#8a6d2f] px-2.5 py-1 rounded-full font-medium">
                3 Design-Templates
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                PDF-Download
              </span>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">10,00 €</span>
              <span className="text-xs text-gray-400">oder Gutscheincode</span>
            </div>
          </motion.button>

          {/* Anschreiben */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => navigate("/anschreiben")}
            className="group relative bg-white border-2 border-gray-100 hover:border-[#1a3a2a] rounded-2xl p-8 text-left shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-[#c9a84c]/15 rounded-xl flex items-center justify-center group-hover:bg-[#c9a84c]/25 transition-colors">
                <PenLine className="w-7 h-7 text-[#8a6d2f]" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#1a3a2a] group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Anschreiben erstellen
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Gib die Stellenanzeige ein und lade deinen Lebenslauf hoch — wir erstellen ein maßgeschneidertes Anschreiben.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-xs bg-[#1a3a2a]/8 text-[#1a3a2a] px-2.5 py-1 rounded-full font-medium">
                <Zap className="w-3 h-3" /> KI-generiert
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-[#c9a84c]/10 text-[#8a6d2f] px-2.5 py-1 rounded-full font-medium">
                Auf Stelle zugeschnitten
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                PDF / Word
              </span>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">10,00 €</span>
              <span className="text-xs text-gray-400">oder Gutscheincode</span>
            </div>
          </motion.button>
        </div>

        {/* Vertrauens-Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 mt-12 text-xs text-gray-400"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#1a3a2a]/50" />
            <span>DSGVO-konform</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-[#c9a84c]/70" />
            <span>Entwickelt in Deutschland</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#1a3a2a]/50" />
            <span>KI nach EU AI Act</span>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-4">
        <div className="max-w-4xl mx-auto px-6 flex justify-center gap-4 text-xs text-gray-400">
          <button onClick={() => setShowImpressum(true)} className="hover:text-gray-600 transition-colors">Impressum</button>
          <span>·</span>
          <button onClick={() => setShowAgb(true)} className="hover:text-gray-600 transition-colors">AGB</button>
          <span>·</span>
          <button onClick={() => setShowDsgvo(true)} className="hover:text-gray-600 transition-colors">Datenschutz</button>
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
