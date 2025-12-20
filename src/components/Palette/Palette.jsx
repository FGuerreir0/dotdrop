import './Palette.css';

function Palette({ onColorSelect, selectedColor, position, isDragging, onMouseDown, layout = 'row' }) {
  return (
      <div 
        className={`palette-container palette-container-${layout} ${isDragging ? 'dragging' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
        onMouseDown={onMouseDown}
      >
        <div className="drag-handle">☰</div>
        {["#000000", "#1a1a1a", "#333333", "#4d4d4d", "#666666", "#808080", "#999999", "#b3b3b3", "#cccccc", "#e6e6e6", "#f0f0f0", "#f5f5f5", "#fafafa", "#fdfdfd", "#ffffff"].map((c) => (
          <button
            key={c}
            className={`palette-button ${selectedColor === c ? 'selected' : ''}`}
            onClick={() => onColorSelect(c)}
            style={{
              backgroundColor: c
            }}
          />
        ))}
      </div>
  )
}

export default Palette;