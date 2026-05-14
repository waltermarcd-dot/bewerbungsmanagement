// Template: Modern — bold gradient header, card-based sections
const PHOTO_DIMS = { small: { w: 72, h: 90 }, medium: { w: 88, h: 108 }, large: { w: 110, h: 136 } };

export default function ModernTemplate({ data, photoUrl, photoSize = 'medium' }) {
  const pd = PHOTO_DIMS[photoSize] || PHOTO_DIMS.medium;
  return (
    <div style={{
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      background: "#f4f6fb", color: "#1a1a2e",
      fontSize: "10.5px", lineHeight: "1.55",
      display: "flex", flexDirection: "column", minHeight: "100%"
    }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #2d3561 0%, #c05c7e 100%)",
        padding: "32px 48px 28px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          {photoUrl && (
            <div style={{
              width: `${pd.w}px`, height: `${pd.h}px`, flexShrink: 0,
              borderRadius: "50%", overflow: "hidden",
              border: "3px solid rgba(255,255,255,0.4)", background: "rgba(0,0,0,0.1)"
            }}>
              <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
            </div>
          )}
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#fff", margin: "0 0 5px", letterSpacing: "0.5px" }}>
              {data.name || "Name"}
            </h1>
            {data.experience?.[0]?.title && (
              <p style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.75)", margin: "0 0 10px", fontWeight: 300 }}>
                {data.experience[0].title}
              </p>
            )}
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {data.email && <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.65)" }}>{data.email}</span>}
              {data.phone && <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.65)" }}>· {data.phone}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Skills bar */}
      {data.skills?.length > 0 && (
        <div style={{ background: "#2d3561", padding: "10px 48px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {data.skills.map((s, i) => (
            <span key={i} style={{
              fontSize: "8.5px", color: "#fff",
              background: "rgba(255,255,255,0.15)",
              padding: "3px 10px", borderRadius: "20px", fontWeight: 500
            }}>{s}</span>
          ))}
        </div>
      )}
      {/* Body */}
      <div style={{ flex: 1, padding: "24px 48px 28px", display: "flex", gap: "28px", background: "#f4f6fb" }}>

        {/* Main */}
        <div style={{ flex: 1 }}>
          {data.summary && (
            <Card>
              <CardHeading label="Profil" />
              <p style={{ fontSize: "10px", color: "#475569", lineHeight: 1.8, margin: 0 }}>{data.summary}</p>
            </Card>
          )}

          {data.experience?.length > 0 && (
            <Card>
              <CardHeading label="Berufserfahrung" />
              {data.experience.map((exp, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "12px", pageBreakInside: "avoid", breakInside: "avoid" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "10.5px", color: "#2d3561" }}>{exp.title}</div>
                    {exp.company && <div style={{ fontSize: "9.5px", color: "#c05c7e", margin: "1px 0 3px", fontWeight: 500 }}>{exp.company}</div>}
                    {exp.description && <div style={{ fontSize: "9.5px", color: "#64748b", lineHeight: 1.65 }}>{exp.description}</div>}
                  </div>
                  {(exp.start || exp.end) && (
                    <div style={{ flexShrink: 0, width: "72px", textAlign: "right" }}>
                      <span style={{ fontSize: "8.5px", color: "#94a3b8" }}>
                        {exp.start && <>{exp.start}<br /></>}{exp.end || ""}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width: "190px", flexShrink: 0 }}>
          {data.education?.length > 0 && (
            <Card>
              <CardHeading label="Ausbildung" />
              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <div style={{ fontWeight: 600, fontSize: "9.5px", color: "#2d3561" }}>{edu.degree}</div>
                  {edu.institution && <div style={{ fontSize: "9px", color: "#64748b", margin: "1px 0 0" }}>{edu.institution}</div>}
                  {edu.year && <div style={{ fontSize: "8.5px", color: "#94a3b8", margin: "1px 0 0" }}>{edu.year}</div>}
                </div>
              ))}
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{ background: "#fff", borderRadius: "10px", padding: "14px 16px", marginBottom: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      {children}
    </div>
  );
}

function CardHeading({ label }) {
  return (
    <div style={{ fontSize: "7.5px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#c05c7e", marginBottom: "10px" }}>
      {label}
    </div>
  );
}