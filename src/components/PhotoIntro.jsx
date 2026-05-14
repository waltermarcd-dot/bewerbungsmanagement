import { motion } from "framer-motion";
import { Camera, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PhotoIntro({ onChoice, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto text-center space-y-8 py-12"
    >
      <div className="space-y-2">
        <h2 className="font-semibold text-xl">{t?.title || "Hast du ein Bewerbungsfoto?"}</h2>
      </div>

      <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
        <Button onClick={() => onChoice("has_photo")} className="gap-2 w-full">
          <ImageIcon className="w-4 h-4" />
          {t?.hasPhoto || "Ja, ich habe bereits ein Foto"}
        </Button>
        <Button variant="outline" onClick={() => onChoice("take_photo")} className="gap-2 w-full">
          <Camera className="w-4 h-4" />
          {t?.takePhoto || "Ich möchte jetzt ein Foto aufnehmen"}
        </Button>
        <button onClick={() => onChoice("no")} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
          {t?.no || "Nein, ohne Foto fortfahren"}
        </button>
      </div>
    </motion.div>
  );
}