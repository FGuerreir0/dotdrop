function Palette({ onColorSelect, selectedColor }) {
  return (
      <div style={{ display: "flex", gap: "6px", marginBottom: "8px", position: "absolute", bottom: "120px" }}>
        {["#FF4500", "#FFA800", "#FFD635", "#00A368", "#7EED56", "#2450A4", "#3690EA", "#51E9F4", "#811E9F", "#B44AC0", "#FF99AA", "#9C6926", "#000000", "#898D90", "#FFFFFF"].map((c) => (
          <button
            key={c}
            onClick={() => onColorSelect(c)}
            style={{
              width: 24,
              height: 24,
              backgroundColor: c,
              border: selectedColor === c ? "2px solid #333" : "1px solid #000",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
  )
}

export default Palette;