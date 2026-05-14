import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function FeedbackSurvey({ isGenerating, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit?.({ rating, feedback });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-6"
      >
        {/* Generating indicator */}
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <div>
            <p className="text-sm font-semibold">PDF wird erstellt…</p>
            <p className="text-xs text-muted-foreground">Das dauert einen kleinen Moment.</p>
          </div>
        </div>

        {!submitted ? (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium">Wie zufrieden warst du mit der Erstellung deines Lebenslaufs?</p>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hovered || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-border"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Was können wir besser machen?</p>
              <Textarea
                placeholder="Dein Feedback hilft uns weiter…"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="w-full"
            >
              Feedback absenden
            </Button>
          </>
        ) : (
          <div className="text-center space-y-2 py-4">
            <p className="text-2xl">🙏</p>
            <p className="font-semibold">Danke für dein Feedback!</p>
            <p className="text-sm text-muted-foreground">Dein PDF ist gleich fertig.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}