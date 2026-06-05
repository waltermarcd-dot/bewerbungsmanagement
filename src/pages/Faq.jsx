import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import AppNavbar from "../components/AppNavbar";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";

const FAQ_DATA = [
  {
    category: "Allgemein",
    items: [
      {
        q: "Was macht JobFertig?",
        a: "JobFertig hilft dir dabei, aus deinem vorhandenen Lebenslauf ein professionelles PDF zu erstellen — mit ansprechendem Design und KI-gestützter Optimierung. Außerdem kannst du automatisch ein passendes Anschreiben für jede Stelle generieren lassen."
      },
      {
        q: "Muss ich mich registrieren?",
        a: "Ja, eine einmalige Registrierung ist notwendig — damit wir deine Daten sicher speichern können und du sie nicht jedes Mal neu eingeben musst. Du kannst dich mit Google oder per E-Mail anmelden."
      },
      {
        q: "Welche Sprachen werden unterstützt?",
        a: "Die App ist auf Deutsch, Englisch, Ukrainisch und Arabisch verfügbar. Du kannst die Sprache jederzeit oben in der Navigationsleiste wechseln."
      },
    ]
  },
  {
    category: "Lebenslauf",
    items: [
      {
        q: "Welche Dateiformate kann ich hochladen?",
        a: "Du kannst PDF-, DOC- und DOCX-Dateien hochladen. Am besten funktioniert ein PDF, da die Textextraktion dort am zuverlässigsten ist."
      },
      {
        q: "Ich habe noch keinen Lebenslauf — was tun?",
        a: "Kein Problem! Auf Schritt 2 gibt es den Tab \"Von mir erzählen\" — dort tippst du einfach in eigenen Worten, was du gelernt hast und wo du gearbeitet hast. Die KI strukturiert daraus automatisch einen vollständigen Lebenslauf."
      },
      {
        q: "Kann ich den Lebenslauf nach der Extraktion bearbeiten?",
        a: "Ja — nach dem Hochladen kannst du alle Felder manuell anpassen: Name, Erfahrungen, Ausbildung, Skills usw. Erst danach wählst du ein Design und lädst das PDF herunter."
      },
      {
        q: "Wie viele Design-Templates gibt es?",
        a: "Es gibt aktuell 3 professionelle Templates zur Auswahl: Modern, Business und Casual. Alle sind DIN-A4-optimiert und ATS-kompatibel."
      },
    ]
  },
  {
    category: "Anschreiben",
    items: [
      {
        q: "Wie funktioniert der Anschreiben-Generator?",
        a: "Du gibst die Stellenbezeichnung und den Arbeitgeber ein, lädst deinen Lebenslauf hoch — und die KI erstellt ein individuelles Anschreiben, das auf die Stelle und dein Profil abgestimmt ist. Du kannst den Text danach frei bearbeiten."
      },
      {
        q: "Kann ich das Anschreiben kostenlos als Word herunterladen?",
        a: "Ja! Den Word-Export (.doc) und den reinen Textexport (.txt) gibt es kostenlos. Nur der PDF-Export mit professionellem Layout ist kostenpflichtig (10 €) oder per Gutscheincode verfügbar."
      },
      {
        q: "Das Datum im PDF steht an der falschen Stelle — was tun?",
        a: "Das wurde behoben! Das Datum erscheint jetzt korrekt oben rechts im Absenderblock, gemäß DIN-5008-Standard. Bitte lade die Seite neu und generiere das Anschreiben erneut."
      },
    ]
  },
  {
    category: "Zahlung & Gutschein",
    items: [
      {
        q: "Was kostet die App?",
        a: "Der Lebenslauf-Download kostet 10 €. Das Anschreiben als PDF kostet ebenfalls 10 €. Wenn du beides zusammen nutzt, lohnt sich ein Bundle — sprich uns gerne an."
      },
      {
        q: "Wie löse ich einen Gutscheincode ein?",
        a: "Auf der Download-Seite gibt es ein Feld \"Gutscheincode eingeben\". Trag deinen Code dort ein und klicke auf \"Einlösen\". Der Download wird sofort freigeschaltet."
      },
      {
        q: "Welche Zahlungsmethoden gibt es?",
        a: "Wir unterstützen aktuell PayPal und Kreditkarte über eine sichere Stripe-Verbindung. Die Zahlung wird direkt nach dem Checkout bestätigt."
      },
    ]
  },
  {
    category: "Datenschutz & Account",
    items: [
      {
        q: "Werden meine Daten gespeichert?",
        a: "Deine Lebenslauf-Daten werden nur für die Dauer deiner Sitzung verarbeitet. Wenn du das Speichern aktivierst, werden sie verschlüsselt in deinem Account hinterlegt. Wir geben keine Daten an Dritte weiter."
      },
      {
        q: "Wie kann ich meinen Account löschen?",
        a: "Auf der Startseite findest du unten den Button \"Account löschen\". Nach einer Bestätigung werden alle deine gespeicherten Daten (Lebensläufe, Anschreiben, Bewerbungen) unwiderruflich gelöscht."
      },
      {
        q: "Ist die App DSGVO-konform?",
        a: "Ja. JobFertig wird von M Corp Apps (Deutschland) betrieben und erfüllt alle Anforderungen der DSGVO. Fonts werden lokal gehostet, keine externen Tracker werden geladen."
      },
    ]
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left text-sm font-medium text-gray-800 hover:text-[#1a3a2a] transition-colors"
      >
        <span>{q}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-inter">
      <AppNavbar
        title="Hilfe & FAQ"
        subtitle="Häufige Fragen"
        icon={HelpCircle}
        showBack={true}
        user={user}
        logout={logout}
      />

      <main className="max-w-2xl mx-auto px-6 py-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Wie können wir helfen?</h1>
          <p className="text-sm text-gray-500">Hier findest du Antworten auf die häufigsten Fragen.</p>
        </motion.div>

        <div className="space-y-6">
          {FAQ_DATA.map((section, i) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="px-6 pt-5 pb-2">
                <h2 className="text-xs font-semibold text-[#1a3a2a] uppercase tracking-wider">{section.category}</h2>
              </div>
              <div className="px-6">
                {section.items.map(item => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400 mb-3">Noch eine Frage? Schreib uns direkt.</p>
          <a
            href="mailto:marc_walter@hotmail.de?subject=Frage zu JobFertig"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a3a2a] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a3d] transition-colors shadow-sm"
          >
            Kontakt aufnehmen
          </a>
        </div>
      </main>
    </div>
  );
}
