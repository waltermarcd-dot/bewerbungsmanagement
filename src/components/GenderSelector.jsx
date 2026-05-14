import { motion } from "framer-motion";
import { User2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GenderSelector({ onSelect, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-lg mx-auto"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <User2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-3xl font-bold">{t.title}</h2>
        <p className="text-muted-foreground text-lg">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => onSelect("female")}
          className="flex flex-col items-center gap-3 px-4 py-6 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
        >
          <span className="text-3xl">👩</span>
          <span className="font-medium text-sm group-hover:text-primary">{t.female}</span>
        </button>
        <button
          onClick={() => onSelect("male")}
          className="flex flex-col items-center gap-3 px-4 py-6 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
        >
          <span className="text-3xl">👨</span>
          <span className="font-medium text-sm group-hover:text-primary">{t.male}</span>
        </button>
        <button
          onClick={() => onSelect("neutral")}
          className="flex flex-col items-center gap-3 px-4 py-6 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
        >
          <span className="text-3xl">🧑</span>
          <span className="font-medium text-sm group-hover:text-primary">{t.neutral}</span>
        </button>
      </div>

      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={() => onSelect("neutral")} className="text-muted-foreground text-xs">
          {t.skip}
        </Button>
      </div>
    </motion.div>
  );
}