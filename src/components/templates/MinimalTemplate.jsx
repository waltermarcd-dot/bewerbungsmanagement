// Template: Minimal — ultra-clean, white space, left accent line
const PHOTO_DIMS = { small: { w: 70, h: 88 }, medium: { w: 85, h: 105 }, large: { w: 110, h: 136 } };

export default function MinimalTemplate({ data, photoUrl, photoSize = 'medium' }) {
  const pd = PHOTO_DIMS[photoSize] || PHOTO_DIMS.medium;
  return (
    <div style={{
      fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
      background: "#fafafa", color: "#222",
      fontSize: "10.5px", lineHeight: "1.6",
      display: "flex", minHeight: "100%"
    }}>
      {/* Left accent strip */}
      <div style={{ width: "5px", background: "#e63946", flexShrink: 0 }} />

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "44px 48px 36px 40px", background: "#fafafa" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "26px", marginBottom: "28px", borderBottom: "1px solid #e5e5e5", paddingBottom: "24px" }}>
          {photoUrl && (
            <div style={{ width: `${pd.w}px`, height: `${pd.h}px`, flexShrink: 0, overflow: "hidden", borderRadius: "2px", background: "#f0f0f0" }}>
              <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
            </div>
          )}
          <div style={{ flex: 1, paddingTop: "4px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 300, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 6px", color: "#111" }}>
              {data.name || "NAME"}
            </h1>
            {data.experience?.[0]?.title && (
              <p style={{ fontSize: "11px", color: "#e63946", margin: "0 0 10px", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 400 }}>
                {data.experience[0].title}
              </p>
            )}
            <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
              {data.email && <span style={{ fontSize: "9px", color: "#888" }}>{data.email}</span>}
              {data.phone && <span style={{ fontSize: "9px", color: "#888" }}>{data.phone}</span>}
            </div>
          </div>
        </div>
        {/* Body */}
        <div style={{ display: "flex", gap: "40px", flex: 1 }}>

          {/* Main */}
          <div style={{ flex: 1 }}>
            {data.summary && (
              <div style={{ marginBottom: "22px" }}>
                <SectionLabel label="Profil" />
                <p style={{ fontSize: "10px", color: "#555", lineHeight: 1.8, margin: 0 }}>{data.summary}</p>
              </div>
            )}

            {data.experience?.length > 0 && (
              <div>
                <SectionLabel label="Berufserfahrung" />
                {data.experience.map((exp, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "14px", pageBreakInside: "avoid", breakInside: "avoid" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "10.5px", color: "#111" }}>{exp.title}</div>
                      {exp.company && <div style={{ fontSize: "9.5px", color: "#888", margin: "1px 0 3px" }}>{exp.company}</div>}
                      {exp.description && <div style={{ fontSize: "9.5px", color: "#666", lineHeight: 1.65 }}>{exp.description}</div>}
                    </div>
                    {(exp.start || exp.end) && (
                      <div style={{ flexShrink: 0, width: "76px", textAlign: "right" }}>
                        <span style={{ fontSize: "8.5px", color: "#aaa" }}>
                          {exp.start && <>{exp.start}<br /></>}{exp.end || ""}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ width: "180px", flexShrink: 0 }}>
            {data.skills?.length > 0 && (
              <div style={{ marginBottom: "22px" }}>
                <SectionLabel label="Kenntnisse" />
                {data.skills.map((s, i) => (
                  <div key={i} style={{ fontSize: "9.5px", color: "#444", padding: "3px 0", borderBottom: "1px solid #eee" }}>{s}</div>
                ))}
              </div>
            )}
            {data.education?.length > 0 && (
              <div>
                <SectionLabel label="Ausbildung" />
                {data.education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: "10px" }}>
                    <div style={{ fontWeight: 600, fontSize: "9.5px", color: "#111" }}>{edu.degree}</div>
                    {edu.institution && <div style={{ fontSize: "9px", color: "#888", margin: "1px 0 0" }}>{edu.institution}</div>}
                    {edu.year && <div style={{ fontSize: "8.5px", color: "#bbb", margin: "1px 0 0" }}>{edu.year}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function SectionLabel({ label }) {
  return (
    <div style={{ fontSize: "7.5px", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#e63946", marginBottom: "10px" }}>
      {label}
    </div>
  );
}