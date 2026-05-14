const PHOTO_DIMS = { small: { w: 72, h: 90 }, medium: { w: 85, h: 105 }, large: { w: 110, h: 136 } };

export default function BusinessTemplate({ data, photoUrl, photoSize = 'medium' }) {
  const pd = PHOTO_DIMS[photoSize] || PHOTO_DIMS.medium;
  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: "#ffffff", color: "#111",
      fontSize: "10.5px", lineHeight: "1.55",
      display: "flex", flexDirection: "column", minHeight: "100%"
    }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ padding: "38px 52px 24px", borderBottom: "2px solid #111" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "28px" }}>
          {photoUrl && (
            <div style={{
              width: `${pd.w}px`, height: `${pd.h}px`, flexShrink: 0,
              border: "1px solid #ccc", overflow: "hidden", background: "#f0f0f0"
            }}>
              <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
            </div>
          )}
          <div style={{ flex: 1, paddingTop: "4px" }}>
            <h1 style={{
              fontSize: "24px", fontWeight: 700, letterSpacing: "2.5px",
              textTransform: "uppercase", margin: "0 0 5px"
            }}>
              {data.name || "NAME"}
            </h1>
            {data.experience?.[0]?.title && (
              <p style={{
                fontSize: "10.5px", color: "#555", letterSpacing: "1px",
                textTransform: "uppercase", margin: "0 0 10px", fontStyle: "italic"
              }}>
                {data.experience[0].title}
              </p>
            )}
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {data.email && (
                <span style={{ fontSize: "9px", color: "#555", letterSpacing: "0.3px" }}>{data.email}</span>
              )}
              {data.phone && (
                <span style={{ fontSize: "9px", color: "#555", letterSpacing: "0.3px" }}>· {data.phone}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div style={{ padding: "22px 52px 28px", flex: 1, background: "#fff" }}>

        {/* Profile / Summary */}
        {data.summary && (
          <div style={{ marginBottom: "18px" }}>
            <SectionHeading label="Profil" />
            <p style={{ fontSize: "10px", color: "#333", lineHeight: 1.75, margin: 0 }}>
              {data.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {data.experience?.length > 0 && (
          <div style={{ marginBottom: "18px" }}>
            <SectionHeading label="Berufserfahrung" />
            {data.experience.map((exp, i) => (
              <div key={i} style={{ display: "flex", gap: "16px", marginBottom: "12px", pageBreakInside: "avoid", breakInside: "avoid" }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    {exp.title}
                  </span>
                  {exp.company && (
                    <p style={{ fontSize: "10px", color: "#666", fontStyle: "italic", margin: "1px 0 4px" }}>
                      {exp.company}
                    </p>
                  )}
                  {exp.description && (
                    <p style={{ fontSize: "9.5px", color: "#444", lineHeight: 1.65, margin: 0 }}>
                      {exp.description}
                    </p>
                  )}
                </div>
                {(exp.start || exp.end) && (
                  <div style={{ flexShrink: 0, width: "80px", textAlign: "right" }}>
                    <span style={{ fontSize: "9px", color: "#777", fontStyle: "italic" }}>
                      {exp.start && <>{exp.start}<br/></>}{exp.end ? exp.end : ""}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education + Skills row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>

          {data.education?.length > 0 && (
            <div>
              <SectionHeading label="Ausbildung" />
              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 700, fontSize: "10px" }}>{edu.degree}</span>
                    {edu.year && <span style={{ fontSize: "9px", color: "#777", fontStyle: "italic" }}>{edu.year}</span>}
                  </div>
                  {edu.institution && (
                    <p style={{ fontSize: "9.5px", color: "#666", fontStyle: "italic", margin: "1px 0 0" }}>
                      {edu.institution}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.skills?.length > 0 && (
            <div>
              <SectionHeading label="Kenntnisse" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 10px" }}>
                {data.skills.map((skill, i) => (
                  <span key={i} style={{
                    fontSize: "9.5px", color: "#333",
                    borderBottom: "1px solid #ccc", paddingBottom: "1px"
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
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
      fontSize: "8px", fontWeight: 700, letterSpacing: "2px",
      textTransform: "uppercase", color: "#111",
      borderBottom: "1px solid #ccc", paddingBottom: "3px",
      marginBottom: "10px"
    }}>
      {label}
    </div>
  );
}