const PHOTO_DIMS = { small: { w: 72, h: 90 }, medium: { w: 85, h: 105 }, large: { w: 110, h: 136 } };

export default function BusinessCasualTemplate({ data, photoUrl, photoSize = 'medium' }) {
  const pd = PHOTO_DIMS[photoSize] || PHOTO_DIMS.medium;
  return (
    <div style={{
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      background: "#f8fafc", color: "#1a1a2e",
      fontSize: "10.5px", lineHeight: "1.55",
      display: "flex", flexDirection: "column", minHeight: "100%"
    }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ background: "#1a1a2e", padding: "28px 40px", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {photoUrl && (
            <div style={{
              width: `${pd.w}px`, height: `${pd.h}px`, flexShrink: 0,
              borderRadius: "4px", overflow: "hidden",
              border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.1)"
            }}>
              <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "0.5px", margin: "0 0 4px", color: "#fff" }}>
              {data.name || "Name"}
            </h1>
            {data.experience?.[0]?.title && (
              <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 8px", fontWeight: 400 }}>
                {data.experience[0].title}
              </p>
            )}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {data.email && <span style={{ fontSize: "9px", color: "#94a3b8" }}>{data.email}</span>}
              {data.phone && <span style={{ fontSize: "9px", color: "#94a3b8" }}>·  {data.phone}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* accent line */}
      <div style={{ height: "3px", background: "#3b82f6" }} />

      {/* ── Body ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1 }}>

        {/* Main column */}
        <div style={{ flex: 1, padding: "22px 28px 22px 40px", background: "#fff" }}>

          {data.summary && (
            <div style={{ marginBottom: "18px" }}>
              <SectionHeading label="Profil" />
              <p style={{ fontSize: "10px", color: "#475569", lineHeight: 1.75, margin: 0 }}>
                {data.summary}
              </p>
            </div>
          )}

          {data.experience?.length > 0 && (
            <div>
              <SectionHeading label="Berufserfahrung" />
              {data.experience.map((exp, i) => (
                <div key={i} style={{ display: "flex", gap: "14px", marginBottom: "13px", pageBreakInside: "avoid", breakInside: "avoid" }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: "10.5px", color: "#1a1a2e" }}>
                      {exp.title}
                    </span>
                    {exp.company && (
                      <p style={{ fontSize: "9.5px", color: "#3b82f6", margin: "1px 0 4px", fontWeight: 500 }}>
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

        {/* Sidebar */}
        <div style={{
          width: "210px", flexShrink: 0,
          background: "transparent", borderLeft: "1px solid #e2e8f0",
          padding: "22px 20px"
        }}>

          {data.skills?.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <SectionHeading label="Kenntnisse" />
              {data.skills.map((skill, i) => (
                <div key={i} style={{
                  fontSize: "9.5px", color: "#334155",
                  padding: "4px 0",
                  borderBottom: "1px solid #e2e8f0"
                }}>
                  {skill}
                </div>
              ))}
            </div>
          )}

          {data.education?.length > 0 && (
            <div>
              <SectionHeading label="Ausbildung" />
              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <p style={{ fontWeight: 600, fontSize: "9.5px", margin: 0, color: "#1a1a2e" }}>
                    {edu.degree}
                  </p>
                  {edu.institution && (
                    <p style={{ fontSize: "9px", color: "#64748b", margin: "1px 0 0" }}>
                      {edu.institution}
                    </p>
                  )}
                  {edu.year && (
                    <p style={{ fontSize: "8.5px", color: "#94a3b8", margin: "1px 0 0" }}>
                      {edu.year}
                    </p>
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

function SectionHeading({ label }) {
  return (
    <div style={{
      fontSize: "8px", fontWeight: 700, letterSpacing: "1.8px",
      textTransform: "uppercase", color: "#3b82f6",
      borderBottom: "1.5px solid #e2e8f0", paddingBottom: "4px",
      marginBottom: "10px"
    }}>
      {label}
    </div>
  );
}