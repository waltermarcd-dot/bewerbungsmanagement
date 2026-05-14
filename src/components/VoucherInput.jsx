import { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Ticket, Loader2, CheckCircle2 } from "lucide-react";

export default function VoucherInput({ onRedeemed }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  const handleRedeem = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    try {
      const results = await base44.entities.VoucherCode.filter({
        code: trimmed,
        is_active: true,
      });

      if (!results || results.length === 0) {
        toast.error("Ungültiger oder deaktivierter Code.");
        setLoading(false);
        return;
      }

      const voucher = results[0];
      const remaining = voucher.total_downloads - voucher.used_downloads;

      if (remaining <= 0) {
        toast.error("Dieses Kontingent ist vollständig aufgebraucht.");
        setLoading(false);
        return;
      }

      setRedeemed(true);
      toast.success(`Code eingelöst! ${remaining} Download${remaining !== 1 ? "s" : ""} verfügbar.`);
      onRedeemed(voucher);
    } catch (e) {
      toast.error("Fehler beim Einlösen: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (redeemed) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 font-medium py-1">
        <CheckCircle2 className="w-4 h-4" />
        Firmen-Gutschein aktiv
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1">
        <Ticket className="w-3.5 h-3.5" /> Firmen-Gutscheincode
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="z.B. FIRMA-ABC-123"
          className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
        />
        <Button size="sm" onClick={handleRedeem} disabled={loading || !code.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Einlösen"}
        </Button>
      </div>
    </div>
  );
}