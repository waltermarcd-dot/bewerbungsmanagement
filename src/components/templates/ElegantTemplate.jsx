// Template: Elegant — serif fonts, gold accent, centered header
const PHOTO_DIMS = { small: { w: 72, h: 90 }, medium: { w: 88, h: 110 }, large: { w: 110, h: 136 } };

export default function ElegantTemplate({ data, photoUrl, photoSize = 'medium' }) {
  const pd = PHOTO_DIMS[photoSize] || PHOTO_DIMS.medium;
  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: "#fffdf7", color: "#1c1c1c",
      fontSize: "10.5px", lineHeight: "1.6",
      display: "flex", flexDirection: "column", minHeight: "100%"
    }}>

      {/* Top gold stripe */}
      <div style={{ height: "6px", background: "linear-gradient(90deg, #b8860b, #d4a017, #b8860b)" }} />

      {/* Header — centered */}
      <div style={{ padding: "30px 56px 24px", textAlign: "center", borderBottom: "1px solid #e8dfc0" }}>
        {photoUrl && (
          <div style={{
            width: `${pd.w}px`, height: `${pd.h}px`,
            margin: "0 auto 14px",
            borderRadius: "50%", overflow: "hidden",
            border: "3px solid #d4a017", background: "#e8dfc0"
          }}>
            <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
          </div>
        )}
        <h1 style={{ fontSize: "26px", fontWeight: 400, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 5px", color: "#1c1c1c" }}>
          {data.name || "NAME"}
        </h1>
        {data.experience?.[0]?.title && (
          <p style={{ fontSize: "11px", color: "#b8860b", margin: "0 0 10px", fontStyle: "italic", letterSpacing: "0.5px" }}>
            {data.experience[0].title}
          </p>
        )}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
          {data.email && <span style={{ fontSize: "9px", color: "#888" }}>{data.email}</span>}
          {data.phone && <span style={{ fontSize: "9px", color: "#888" }}>· {data.phone}</span>}
        </div>
      </div>
      {/* Body */}
      <div style={{ flex: 1, padding: "24px 56px 32px", display: "flex", gap: "36px", background: "#fffdf7" }}>

        {/* Main */}
        <div style={{ flex: 1 }}>
          {data.summary && (
            <div style={{ marginBottom: "20px" }}>
              <GoldHeading label="Profil" />
              <p style={{ fontSize: "10px", color: "#555", lineHeight: 1.85, margin: 0, fontStyle: "italic" }}>{data.summary}</p>
            </div>
          )}

          {data.experience?.length > 0 && (
            <div>
              <GoldHeading label="Berufserfahrung" />
              {data.experience.map((exp, i) => (
                <div key={i} style={{ display: "flex", gap: "14px", marginBottom: "14px", pageBreakInside: "avoid", breakInside: "avoid" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "10.5px", color: "#1c1c1c" }}>{exp.title}</div>
                    {exp.company && <div style={{ fontSize: "9.5px", color: "#b8860b", margin: "1px 0 3px", fontStyle: "italic" }}>{exp.company}</div>}
                    {exp.description && <div style={{ fontSize: "9.5px", color: "#666", lineHeight: 1.7 }}>{exp.description}</div>}
                  </div>
                  {(exp.start || exp.end) && (
                    <div style={{ flexShrink: 0, width: "76px", textAlign: "right" }}>
                      <span style={{ fontSize: "8.5px", color: "#aaa", fontStyle: "italic" }}>
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
        <div style={{ width: "185px", flexShrink: 0 }}>
          {data.skills?.length > 0 && (
            <div style={{ marginBottom: "22px" }}>
              <GoldHeading label="Kenntnisse" />
              {data.skills.map((s, i) => (
                <div key={i} style={{
                  fontSize: "9.5px", color: "#444",
                  padding: "4px 0",
                  borderBottom: "1px solid #e8dfc0"
                }}>{s}</div>
              ))}
            </div>
          )}
          {data.education?.length > 0 && (
            <div>
              <GoldHeading label="Ausbildung" />
              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <div style={{ fontWeight: 700, fontSize: "9.5px", color: "#1c1c1c" }}>{edu.degree}</div>
                  {edu.institution && <div style={{ fontSize: "9px", color: "#888", fontStyle: "italic", margin: "1px 0 0" }}>{edu.institution}</div>}
                  {edu.year && <div style={{ fontSize: "8.5px", color: "#b8860b", margin: "1px 0 0" }}>{edu.year}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Bottom gold stripe */}
      <div style={{ height: "4px", background: "linear-gradient(90deg, #b8860b, #d4a017, #b8860b)" }} />
    </div>
  );
}

function GoldHeading({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
      <div style={{ flex: 1, height: "1px", background: "#d4a017" }} />
      <span style={{ fontSize: "7.5px", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#b8860b" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "#d4a017" }} />
    </div>
  );
}