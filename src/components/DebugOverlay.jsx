export default function DebugOverlay({ currentUser, isLoggedIn, step, lastAction, onDebugReset }) {
  const downloadsUsed = currentUser
    ? parseInt(localStorage.getItem(`downloads_${currentUser.username}`) || '0', 10)
    : 0;

  const rows = [
    ["isLoggedIn", String(isLoggedIn)],
    ["username", currentUser?.username ?? "null"],
    ["unlimited", currentUser ? String(currentUser.unlimited) : "null"],
    ["maxDownloads", currentUser?.maxDownloads == null ? "null" : String(currentUser.maxDownloads)],
    ["downloadsUsed", String(downloadsUsed)],
    ["step", step],
    ["lastAction", lastAction],
  ];

  return (
    <div style={{
      position: "fixed", bottom: 12, right: 12, zIndex: 9999,
      background: "rgba(15,23,42,0.93)", color: "#e2e8f0",
      borderRadius: 10, padding: "10px 14px", fontSize: 11,
      fontFamily: "monospace", minWidth: 220, maxWidth: 280,
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      border: "1px solid rgba(255,255,255,0.08)"
    }}>
      <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: 1, color: "#94a3b8", marginBottom: 6 }}>
        🧪 DEBUG OVERLAY
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {rows.map(([key, val]) => (
            <tr key={key}>
              <td style={{ color: "#64748b", paddingRight: 8, paddingBottom: 3 }}>{key}</td>
              <td style={{ color: val === "false" || val === "null" ? "#f87171" : "#4ade80", fontWeight: 600 }}>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={onDebugReset}
        style={{
          marginTop: 10, width: "100%", padding: "5px 0",
          background: "#dc2626", color: "#fff", border: "none",
          borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "monospace"
        }}
      >
        ⟳ Debug zurücksetzen
      </button>
    </div>
  );
}