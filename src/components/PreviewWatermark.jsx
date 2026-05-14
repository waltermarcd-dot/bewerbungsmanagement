export default function PreviewWatermark() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 10,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: "6px",
      }}
    >
      <span
        style={{
          fontSize: "7px",
          fontWeight: 500,
          letterSpacing: "1.5px",
          color: "rgba(0,0,0,0.28)",
          userSelect: "none",
          textTransform: "uppercase",
          backgroundColor: "rgba(255,255,255,0.6)",
          padding: "2px 6px",
          borderRadius: "3px",
        }}
      >
        Wasserzeichen verschwindet nach dem Download
      </span>
    </div>
  );
}