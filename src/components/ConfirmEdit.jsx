import { motion } from "framer-motion";
import { Pencil, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfirmEdit({ onConfirm, onSkip }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto text-center space-y-8 py-16"
    >
      <div className="space-y-3">

        <h2 className="font-semibold text-xl">Lebenslauf bearbeiten?</h2>
        <p className="text-muted-foreground text-sm">
          Möchtest du die extrahierten Daten prüfen und bearbeiten, bevor du ein Layout wählst?
        </p>
      </div>

      <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
        <Button onClick={onConfirm} className="gap-2 w-full">
          <Pencil className="w-4 h-4" />
          Ja, Daten bearbeiten
        </Button>
        <Button variant="outline" onClick={onSkip} className="gap-2 w-full">
          <ArrowRight className="w-4 h-4" />
          Nein, direkt zum Layout
        </Button>
      </div>
    </motion.div>
  );
}