import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, ZoomIn, X, ZoomIn as ZoomInIcon } from "lucide-react";
import PreviewWatermark from "./PreviewWatermark";
import { Button } from "@/components/ui/button";
import CasualTemplate from "./templates/CasualTemplate";
import BusinessCasualTemplate from "./templates/BusinessCasualTemplate";
import BusinessTemplate from "./templates/BusinessTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import ModernTemplate from "./templates/ModernTemplate";
import ElegantTemplate from "./templates/ElegantTemplate";

const CLOTHING = {
  neutral: {
    casual: "clothing (casual-smart: neat sweater or smart casual shirt in warm colors)",
    "business-casual": "clothing (smart business casual: blazer or neat collared shirt)",
    business: "clothing (formal business: suit and tie or formal blazer)",
    minimal: "clothing (clean minimal style: neat plain shirt or blouse in neutral tones)",
    modern: "clothing (modern professional: stylish blazer or smart top in contemporary colors)",
    elegant: "clothing (elegant formal: refined blazer or elegant blouse with tasteful accessories)",
  },
  female: {
    casual: "clothing (casual-smart for women: neat blouse or stylish sweater in warm colors, smart casual)",
    "business-casual": "clothing (business casual for women: smart blouse or blazer with professional trousers or skirt)",
    business: "clothing (formal business for women: professional blazer with formal blouse or elegant business suit)",
    minimal: "clothing (clean minimal for women: neat plain blouse or sweater in neutral tones)",
    modern: "clothing (modern professional for women: stylish blazer or smart top in contemporary colors)",
    elegant: "clothing (elegant formal for women: refined blazer or elegant blouse with tasteful accessories)",
  },
  male: {
    casual: "clothing (casual-smart for men: neat sweater or smart casual shirt in warm colors)",
    "business-casual": "clothing (business casual for men: blazer or neat collared shirt, professional trousers)",
    business: "clothing (formal business for men: suit and tie or formal blazer with dress shirt)",
    minimal: "clothing (clean minimal for men: neat plain shirt in neutral tones)",
    modern: "clothing (modern professional for men: stylish blazer or smart shirt in contemporary colors)",
    elegant: "clothing (elegant formal for men: refined suit or blazer with tasteful tie)",
  },
};

const STYLES = [
  {
    id: "casual",
    label: "Casual",
    emoji: "🎨",
    description: "Modern & kreativ. Farbenfroh, freundlich, perfekt für kreative Branchen.",
    photoPrompt: "Enhance this headshot photo for a creative casual resume. CRITICAL: The person's face, features, and identity MUST remain 100% recognizable and unchanged — do NOT alter the face, facial structure, or likeness in any way. Only improve: clothing (casual-smart: neat sweater or smart casual shirt in warm colors), background (soft warm neutral), and lighting (warm, soft). Keep their natural smile and personality. Minimum change, maximum professionalism.",
    Component: CasualTemplate,
    accent: "from-blue-600 to-blue-400",
    border: "border-blue-400",
    ring: "ring-blue-400",
  },
  {
    id: "business-casual",
    label: "Business Casual",
    emoji: "💼",
    description: "Professionell & modern. Klar strukturiert, mit Farbe — ideal für die meisten Jobs.",
    photoPrompt: "Enhance this headshot photo for a business casual resume. CRITICAL: The person's face, features, and identity MUST remain 100% recognizable and unchanged — do NOT alter the face, facial structure, or likeness in any way. Only improve: clothing (smart business casual: blazer or neat collared shirt), background (clean neutral), and lighting (professional, balanced). Friendly, confident expression preserved. Minimum change, maximum professionalism.",
    Component: BusinessCasualTemplate,
    accent: "from-slate-700 to-teal-600",
    border: "border-teal-400",
    ring: "ring-teal-400",
  },
  {
    id: "business",
    label: "Business",
    emoji: "🏛️",
    description: "Klassisch & konservativ. Zeitlos elegant, für Führungspositionen und traditionelle Branchen.",
    photoPrompt: "Enhance this headshot photo for a formal business resume. CRITICAL: The person's face, features, and identity MUST remain 100% recognizable and unchanged — do NOT alter the face, facial structure, or likeness in any way. Only improve: clothing (formal business: suit and tie or formal blazer), background (neutral or dark executive), and lighting (high-quality, professional). Confident, composed expression preserved. Minimum change, maximum professionalism.",
    Component: BusinessTemplate,
    accent: "from-gray-700 to-gray-900",
    border: "border-gray-600",
    ring: "ring-gray-600",
  },
  {
    id: "minimal",
    label: "Minimal",
    emoji: "⬜",
    description: "Schlicht & elegant. Viel Weißraum, roter Akzent — perfekt für alle, die auf Klarheit setzen.",
    photoPrompt: "Enhance this headshot photo for a clean minimal resume. CRITICAL: The person's face, features, and identity MUST remain 100% recognizable and unchanged — do NOT alter the face, facial structure, or likeness in any way. Only improve: clothing (clean minimal style: neat plain shirt or blouse in neutral tones), background (pure white or light neutral), and lighting (clean, even). Natural expression preserved. Minimum change, maximum professionalism.",
    Component: MinimalTemplate,
    accent: "from-red-600 to-red-400",
    border: "border-red-400",
    ring: "ring-red-400",
  },
  {
    id: "modern",
    label: "Modern",
    emoji: "✨",
    description: "Frisch & dynamisch. Gradient-Header, Card-Layout — ideal für junge Branchen & Start-ups.",
    photoPrompt: "Enhance this headshot photo for a modern dynamic resume. CRITICAL: The person's face, features, and identity MUST remain 100% recognizable and unchanged — do NOT alter the face, facial structure, or likeness in any way. Only improve: clothing (modern professional: stylish blazer or smart top in contemporary colors), background (clean neutral), and lighting (bright, professional). Friendly, energetic expression preserved. Minimum change, maximum professionalism.",
    Component: ModernTemplate,
    accent: "from-purple-700 to-pink-500",
    border: "border-pink-400",
    ring: "ring-pink-400",
  },
  {
    id: "elegant",
    label: "Elegant",
    emoji: "✨",
    description: "Zeitlos & edel. Goldene Akzente, Serifenschrift — für gehobene Positionen & kreative Führung.",
    photoPrompt: "Enhance this headshot photo for an elegant premium resume. CRITICAL: The person's face, features, and identity MUST remain 100% recognizable and unchanged — do NOT alter the face, facial structure, or likeness in any way. Only improve: clothing (elegant formal: refined blazer or elegant blouse with tasteful accessories), background (warm neutral or soft cream), and lighting (warm, sophisticated). Warm, distinguished expression preserved. Minimum change, maximum professionalism.",
    Component: ElegantTemplate,
    accent: "from-yellow-700 to-yellow-500",
    border: "border-yellow-500",
    ring: "ring-yellow-500",
  },
];

export default function TemplateSelector({ resumeData, photo, onFinished, t, gender }) {
  const [selected, setSelected] = useState(null);
  const [zoomed, setZoomed] = useState(null);

  // Pinch-to-zoom state
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const lastTouchRef = useRef(null);
  const lastDistRef = useRef(null);
  const lastScaleRef = useRef(1);

  const openZoom = (style) => {
    setZoomed(style);
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
    lastScaleRef.current = 1;
  };

  const getDist = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      lastDistRef.current = getDist(e.touches);
      lastScaleRef.current = scale;
    } else if (e.touches.length === 1) {
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, [scale]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 2 && lastDistRef.current !== null) {
      const dist = getDist(e.touches);
      const newScale = Math.min(4, Math.max(1, lastScaleRef.current * (dist / lastDistRef.current)));
      setScale(newScale);
    } else if (e.touches.length === 1 && lastTouchRef.current) {
      const dx = e.touches[0].clientX - lastTouchRef.current.x;
      const dy = e.touches[0].clientY - lastTouchRef.current.y;
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (scale > 1) {
        setTranslateX(prev => prev + dx);
        setTranslateY(prev => prev + dy);
      }
    }
  }, [scale]);

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) {
      lastDistRef.current = null;
    }
    if (e.touches.length === 0) {
      lastTouchRef.current = null;
    }
  }, []);

  const handleConfirm = () => {
    if (!selected) return;
    const style = STYLES.find(s => s.id === selected);
    const g = gender || "neutral";
    const clothingDesc = CLOTHING[g]?.[selected] || CLOTHING.neutral[selected];
    const dynamicPhotoPrompt = style.photoPrompt.replace(
      /clothing \([^)]+\)/,
      clothingDesc
    );
    onFinished({ styleId: selected, style: { ...style, photoPrompt: dynamicPhotoPrompt } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold">{t.title}</h2>
        <p className="text-muted-foreground mt-2">{t.subtitle}</p>
      </div>

      {/* Zoom modal */}
      {zoomed && (() => {
        const ZoomedComponent = zoomed.Component;
        return (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setZoomed(null)}
          >
            <div
              className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className={`bg-gradient-to-r ${zoomed.accent} px-4 py-2 flex items-center justify-between`}>
                <span className="text-white font-semibold text-sm">{zoomed.emoji} {zoomed.label}</span>
                <div className="flex items-center gap-3">
                  {scale > 1 && (
                    <button
                      onClick={() => { setScale(1); setTranslateX(0); setTranslateY(0); }}
                      className="text-white/70 hover:text-white text-xs underline"
                    >
                      Zurücksetzen
                    </button>
                  )}
                  <button onClick={() => setZoomed(null)} className="text-white/80 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div
                style={{ position: "relative", height: "560px", overflow: "hidden", touchAction: "none", cursor: scale > 1 ? "grab" : "pointer" }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => { if (scale === 1) setZoomed(null); }}
              >
                <div style={{
                  position: "absolute", top: 0, left: 0,
                  width: "794px", height: "1123px",
                  transform: `translate(${translateX}px, ${translateY}px) scale(${0.5 * scale})`,
                  transformOrigin: "top left",
                  pointerEvents: "none",
                  transition: lastDistRef.current ? "none" : "transform 0.15s ease"
                }}>
                  <ZoomedComponent data={resumeData} photoUrl={photo?.preview} />
                </div>
                <PreviewWatermark />
                {scale === 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none">
                    <span>👌</span>
                    <span>Zwei Finger zum Vergrößern</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {STYLES.map((style) => (
          <motion.div
            key={style.id}
            whileHover={{ y: -4 }}
            onClick={() => setSelected(style.id)}
            className={`cursor-pointer rounded-xl border-2 transition-all overflow-hidden ${
              selected === style.id
                ? `${style.border} ring-2 ${style.ring} shadow-xl`
                : "border-border hover:border-primary/30 shadow-sm"
            }`}
          >
            <div className={`bg-gradient-to-r ${style.accent} px-2 py-1.5 flex items-center justify-between`}>
              <span className="text-white font-semibold text-xs">{style.emoji} {style.label}</span>
              {selected === style.id && (
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-green-600" />
                </div>
              )}
            </div>

            <div className="bg-white overflow-hidden" style={{ position: "relative", height: "200px" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "794px", height: "1123px", transform: "scale(0.252)", transformOrigin: "top left", pointerEvents: "none" }}>
                <style.Component data={resumeData} photoUrl={photo?.preview} />
              </div>
              <PreviewWatermark />
              <button
                onClick={(e) => { e.stopPropagation(); openZoom(style); }}
                className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors z-10"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>

            <div className="px-2 py-2 bg-card border-t border-border hidden sm:block">
              <p className="text-xs text-muted-foreground leading-relaxed">{style.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleConfirm}
          disabled={!selected}
          size="lg"
          className="h-14 px-10 text-base font-medium rounded-xl"
        >
          {selected ? `${STYLES.find(s => s.id === selected)?.emoji} ${t.useLayout}` : t.selectLayout}
        </Button>
      </div>
    </motion.div>
  );
}