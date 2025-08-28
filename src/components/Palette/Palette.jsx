function Palette({ onColorSelect, selectedColor }) {
  return (
      <div style={{ display: "flex", gap: "6px", marginBottom: "8px", position: "absolute", bottom: "120px" }}>
        {["#FF0000", "#00FF00", "#0000FF", "#000000", "#FFFFFF"].map((c) => (
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