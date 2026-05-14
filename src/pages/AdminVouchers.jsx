import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, RefreshCw, Trash2, ToggleLeft, ToggleRight, Copy, Download } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

function generateCode(companyName) {
  const prefix = companyName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 5);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${random}`;
}

export default function AdminVouchers() {
  const { user, isAuthenticated } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vouchers");
  const [form, setForm] = useState({ company_name: "", total_downloads: 10, notes: "" });
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === "admin";

  const load = async () => {
    setLoading(true);
    const [v, d] = await Promise.all([
      base44.entities.VoucherCode.list("-created_date", 100),
      base44.entities.DownloadEvent.list("-downloaded_at", 50),
    ]);
    setVouchers(v);
    setDownloads(d);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.company_name.trim()) { toast.error("Firmenname fehlt."); return; }
    setSaving(true);
    const code = generateCode(form.company_name);
    await base44.entities.VoucherCode.create({
      code,
      company_name: form.company_name.trim(),
      total_downloads: Number(form.total_downloads),
      used_downloads: 0,
      notes: form.notes.trim(),
      is_active: true,
    });
    toast.success(`Code erstellt: ${code}`);
    setForm({ company_name: "", total_downloads: 10, notes: "" });
    setSaving(false);
    load();
  };

  const handleAddDownloads = async (voucher, amount) => {
    await base44.entities.VoucherCode.update(voucher.id, {
      total_downloads: voucher.total_downloads + amount,
    });
    toast.success(`+${amount} Downloads hinzugefügt.`);
    load();
  };

  const handleToggle = async (voucher) => {
    await base44.entities.VoucherCode.update(voucher.id, { is_active: !voucher.is_active });
    load();
  };

  const handleDelete = async (voucher) => {
    if (!confirm(`Code "${voucher.code}" wirklich löschen?`)) return;
    await base44.entities.VoucherCode.delete(voucher.id);
    toast.success("Code gelöscht.");
    load();
  };

  if (!isAdmin) {
    return <div className="p-8 text-center text-muted-foreground">Kein Zugriff. Nur für Admins.</div>;
  }

  const totalDownloads = downloads.length;
  const stripeDownloads = downloads.filter(d => d.voucher_code?.startsWith('STRIPE')).length;
  const voucherDownloads = totalDownloads - stripeDownloads;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin-Dashboard</h1>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-primary">{totalDownloads}</p>
          <p className="text-xs text-muted-foreground mt-1">Downloads gesamt</p>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{stripeDownloads}</p>
          <p className="text-xs text-muted-foreground mt-1">Stripe-Käufe (10€)</p>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{voucherDownloads}</p>
          <p className="text-xs text-muted-foreground mt-1">Voucher-Downloads</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {["vouchers","downloads"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "vouchers" ? "🎫 Gutschein-Codes" : "📥 Download-Protokoll"}
          </button>
        ))}
      </div>

      {/* Vouchers Tab */}
      {activeTab === "vouchers" && (
        <div className="space-y-4">
          {/* Neuer Code */}
          <div className="bg-card border rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold">Neuen Code erstellen</h2>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="border rounded-md px-3 py-2 text-sm"
                placeholder="Firmenname"
                value={form.company_name}
                onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
              />
              <input
                type="number"
                className="border rounded-md px-3 py-2 text-sm"
                placeholder="Anzahl Downloads"
                value={form.total_downloads}
                onChange={e => setForm(f => ({ ...f, total_downloads: e.target.value }))}
              />
            </div>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Notizen (optional)"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
            <Button onClick={handleCreate} disabled={saving} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              {saving ? "Erstelle..." : "Code erstellen"}
            </Button>
          </div>

          {/* Code-Liste */}
          <div className="space-y-2">
            {vouchers.map(v => {
              const remaining = v.total_downloads - v.used_downloads;
              const pct = Math.round((v.used_downloads / v.total_downloads) * 100) || 0;
              return (
                <div key={v.id} className={`bg-card border rounded-xl p-4 ${!v.is_active ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-sm font-mono font-bold bg-muted px-2 py-0.5 rounded">{v.code}</code>
                        <span className="text-xs text-muted-foreground">{v.company_name}</span>
                        {!v.is_active && <span className="text-xs text-red-500">inaktiv</span>}
                      </div>
                      {v.notes && <p className="text-xs text-muted-foreground mt-1">{v.notes}</p>}
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{v.used_downloads} / {v.total_downloads} genutzt</span>
                          <span>{remaining} verbleibend</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => { navigator.clipboard.writeText(v.code); toast.success("Kopiert!"); }} className="p-1.5 hover:bg-muted rounded-md" title="Kopieren">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleAddDownloads(v, 10)} className="p-1.5 hover:bg-muted rounded-md text-xs font-medium" title="+10">+10</button>
                      <button onClick={() => handleAddDownloads(v, 100)} className="p-1.5 hover:bg-muted rounded-md text-xs font-medium" title="+100">+100</button>
                      <button onClick={() => handleToggle(v)} className="p-1.5 hover:bg-muted rounded-md">
                        {v.is_active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDelete(v)} className="p-1.5 hover:bg-muted rounded-md text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Downloads Tab */}
      {activeTab === "downloads" && (
        <div className="space-y-2">
          {downloads.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Noch keine Downloads.</p>
          ) : downloads.map(d => (
            <div key={d.id} className="bg-card border rounded-xl p-3 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    d.app_type === 'lebenslauf' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {d.app_type === 'lebenslauf' ? '📄 Lebenslauf' : '✉️ Anschreiben'}
                  </span>
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                    d.voucher_code?.startsWith('STRIPE') ? 'bg-green-100 text-green-700' : 'bg-muted'
                  }`}>
                    {d.voucher_code?.startsWith('STRIPE') ? '💳 Stripe-Kauf' : d.voucher_code}
                  </span>
                  <span className="text-xs text-muted-foreground">{d.company_name}</span>
                </div>
                {d.message && <p className="text-xs text-muted-foreground mt-1 truncate">{d.message}</p>}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {d.downloaded_at ? new Date(d.downloaded_at).toLocaleString('de-DE', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
