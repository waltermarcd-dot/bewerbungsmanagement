/**
 * AppNavbar — Einheitliche obere Leiste für alle Seiten
 *
 * Props:
 *   title       — Seitentitel (z.B. "Lebenslauf-Optimierer")
 *   subtitle    — Untertitel (z.B. "Professionell. In Sekunden.")
 *   icon        — Lucide-Icon-Komponente
 *   steps       — Array [{id, label}] für Schritt-Indikatoren (optional)
 *   currentStep — aktuelle Schritt-ID (optional)
 *   lang / setLang — für Sprachswitcher (optional)
 *   user / logout  — für User-Badge rechts (optional)
 *   showBack    — Zurück-zur-Startseite-Link anzeigen (default: true)
 */
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AppNavbar({
  title,
  subtitle,
  icon: Icon,
  steps,
  currentStep,
  lang,
  setLang,
  user,
  logout,
  showBack = true,
}) {
  return (
    <nav className="sticky top-0 z-50 bg-[#1a3a2a] border-b border-[#2d5a3d] shadow-md">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

        {/* ── Links: Zurück + Logo + Titel ── */}
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-[#c9a84c]/80 hover:text-[#c9a84c] transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Startseite</span>
            </Link>
          )}

          <div className="flex items-center gap-2 min-w-0">
            {Icon && (
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-[#f5c842]" />
              </div>
            )}
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-bold text-sm text-white tracking-tight truncate">{title}</span>
              {subtitle && (
                <span className="text-[10px] text-[#c9a84c]/80 hidden sm:block truncate">{subtitle}</span>
              )}
            </div>
          </div>

          {/* Sprach-Switcher */}
          {setLang && (
            <div className="ml-1 shrink-0">
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                dir="ltr"
                className="px-2 py-0.5 rounded-md border border-white/30 text-xs text-white bg-white/10 hover:bg-white/20 transition-all cursor-pointer appearance-none pr-5"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23ffffff80'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 4px center",
                }}
              >
                <option value="de">🇩🇪 DE</option>
                <option value="en">🇬🇧 EN</option>
                <option value="uk">🇺🇦 UK</option>
                <option value="ar">🇸🇦 AR</option>
              </select>
            </div>
          )}
        </div>

        {/* ── Mitte: Schritt-Indikatoren (optional) ── */}
        {steps && steps.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {steps.map((s, i) => {
              const active = currentStep === s.id;
              const done = currentStep > s.id;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      active
                        ? "bg-[#c9a84c] text-[#1a3a2a] shadow-sm"
                        : done
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/40"
                    }`}>
                      {done ? "✓" : s.id}
                    </div>
                    <span className={`text-xs font-medium hidden md:inline transition-all ${
                      active ? "text-[#c9a84c] font-semibold" : done ? "text-white/60" : "text-white/30"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-6 h-px transition-all ${done ? "bg-[#c9a84c]/50" : "bg-white/20"}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Rechts: User + Abmelden ── */}
        {user && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-white/60 hidden md:block truncate max-w-[140px]">{user.email}</span>
            {logout && (
              <button
                onClick={logout}
                className="text-xs text-white/80 hover:text-white border border-white/30 hover:border-white/60 px-3 py-1 rounded-lg transition-colors whitespace-nowrap"
              >
                Abmelden
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
