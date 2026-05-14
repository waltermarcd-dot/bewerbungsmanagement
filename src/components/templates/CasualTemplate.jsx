const PHOTO_DIMS = { small: { w: 72, h: 90 }, medium: { w: 85, h: 105 }, large: { w: 110, h: 136 } };

export default function CasualTemplate({ data, photoUrl, photoSize = 'medium' }) {
  const pd = PHOTO_DIMS[photoSize] || PHOTO_DIMS.medium;
  return (
    <div style={{
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      background: "#f0f4f8", color: "#1e293b",
      fontSize: "10.5px", lineHeight: "1.55",
      display: "flex", flexDirection: "column", minHeight: "100%"
    }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ background: "#1e3a5f", padding: "28px 40px", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {photoUrl && (
            <div style={{
              width: `${pd.w}px`, height: `${pd.h}px`, flexShrink: 0,
              borderRadius: "8px", overflow: "hidden",
              border: "2px solid rgba(255,255,255,0.25)", background: "rgba(0,0,0,0.1)"
            }}>
              <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px", color: "#fff", letterSpacing: "0.3px" }}>
              {data.name || "Name"}
            </h1>
            {data.experience?.[0]?.title && (
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", margin: "0 0 8px" }}>
                {data.experience[0].title}
              </p>
            )}
            <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
              {data.email && <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)" }}>{data.email}</span>}
              {data.phone && <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)" }}>·  {data.phone}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1 }}>

        {/* Sidebar */}
        <div style={{
          width: "210px", flexShrink: 0,
          background: "transparent",
          padding: "22px 18px"
        }}>

          {data.skills?.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <SideHeading label="Kenntnisse" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {data.skills.map((skill, i) => (
                  <span key={i} style={{
                    fontSize: "8.5px", color: "#1e3a5f",
                    background: "#dbeafe", padding: "3px 8px",
                    borderRadius: "20px", fontWeight: 500
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.education?.length > 0 && (
            <div>
              <SideHeading label="Ausbildung" />
              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <p style={{ fontWeight: 700, fontSize: "9.5px", margin: 0, color: "#1e293b" }}>
                    {edu.degree}
                  </p>
                  {edu.institution && (
                    <p style={{ fontSize: "9px", color: "#2e6da4", margin: "1px 0 0" }}>
                      {edu.institution}
                    </p>
                  )}
                  {edu.year && (
                    <p style={{ fontSize: "8.5px", color: "#94a3b8", margin: "2px 0 0" }}>
                      {edu.year}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "22px 32px 22px 28px", background: "#fff" }}>

          {data.summary && (
            <div style={{ marginBottom: "18px" }}>
              <MainHeading label="Über mich" />
              <p style={{ fontSize: "10px", color: "#475569", lineHeight: 1.75, margin: 0 }}>
                {data.summary}
              </p>
            </div>
          )}

          {data.experience?.length > 0 && (
            <div>
              <MainHeading label="Berufserfahrung" />
              {data.experience.map((exp, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "13px", pageBreakInside: "avoid", breakInside: "avoid" }}>
                  <div style={{ flex: 1, paddingLeft: "10px", borderLeft: "2.5px solid #93c5fd" }}>
                    <span style={{ fontWeight: 700, fontSize: "10.5px", color: "#1e293b" }}>
                      {exp.title}
                    </span>
                    {exp.company && (
                      <p style={{ fontSize: "9.5px", color: "#2e6da4", margin: "1px 0 4px" }}>
                        {exp.company}
                      </p>
                    )}
                    {exp.description && (
                      <p style={{ fontSize: "9.5px", color: "#64748b", lineHeight: 1.65, margin: 0 }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                  {(exp.start || exp.end) && (
                    <div style={{ flexShrink: 0, width: "72px", textAlign: "right" }}>
                      <span style={{ fontSize: "9px", color: "#94a3b8" }}>
                        {exp.start && <>{exp.start}<br/></>}{exp.end ? exp.end : ""}
                      </span>
                    </div>
                  )}
                </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SideHeading({ label }) {
  return (
    <div style={{
      fontSize: "7.5px", fontWeight: 700, letterSpacing: "1.8px",
      textTransform: "uppercase", color: "#1e3a5f",
      borderBottom: "1.5px solid #bfdbfe", paddingBottom: "3px",
      marginBottom: "9px"
    }}>
      {label}
    </div>
  );
}

function MainHeading({ label }) {
  return (
    <div style={{
      fontSize: "7.5px", fontWeight: 700, letterSpacing: "1.8px",
      textTransform: "uppercase", color: "#1e3a5f",
      borderBottom: "1.5px solid #bfdbfe", paddingBottom: "3px",
      marginBottom: "10px"
    }}>
      {label}
    </div>
  );
}