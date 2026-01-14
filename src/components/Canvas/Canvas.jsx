/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState, useEffect } from "react";
import Palette from "../Palette/Palette";
import supabase from "../../hook/supabaseClient"; 

import './Canvas.css';

function Canvas({ width = 500, height = 500, pixelSize = 10, onPixelClick }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pixels, setPixels] = useState({}); 
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [loading, setLoading] = useState(true);
  const [cooldown, setCooldown] = useState(0); // cooldown in seconds
  const [canPlace, setCanPlace] = useState(true); // can the user place a pixel
  
  // Zoom and Pan state
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  // Tooltip state
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    pixelX: 0,
    pixelY: 0,
    color: '#000000'
  });
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Draggable UI state
  const [controlsPosition, setControlsPosition] = useState({ x: window.innerWidth - 100, y: 90 });
  const [palettePosition, setPalettePosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight - 120 });
  const [isDraggingControls, setIsDraggingControls] = useState(false);
  const [isDraggingPalette, setIsDraggingPalette] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const columns = Math.floor(width / pixelSize);
  const rows = Math.floor(height / pixelSize);

  const drawGrid = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Save context state
    ctx.save();
    
    // Clear entire canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    
    // Apply zoom and pan transformations
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // Draw pixels
    Object.entries(pixels).forEach(([key, color]) => {
      const [x, y] = key.split(",").map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    });

    // Draw grid
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 0.3 / zoom;
    for (let x = 0; x <= columns; x++) {
      ctx.beginPath();
      ctx.moveTo(x * pixelSize, 0);
      ctx.lineTo(x * pixelSize, height);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * pixelSize);
      ctx.lineTo(width, y * pixelSize);
      ctx.stroke();
    }
    
    // Restore context state
    ctx.restore();
  };

  useEffect(() => {
    drawGrid();
  }, [pixels, zoom, panOffset]);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            setCanPlace(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    const loadPixels = async () => {
      setLoading(true);
      let pixelMap = {};
      let from = 0;
      const pageSize = 1000;
      let done = false;

      while (!done) {
        const { data, error } = await supabase
          .from('pixels202508')
          .select('x, y, color')
          .range(from, from + pageSize - 1);

        if (error) {
          console.error('Error loading pixels:', error);
          setLoading(false);
          return;
        }

        if (data.length === 0) done = true;
        else {
          data.forEach(p => {
            pixelMap[`${p.x},${p.y}`] = p.color;
          });
          from += pageSize;
        }
      }

      setPixels(pixelMap);
      setLoading(false);
    };

    loadPixels();

    const channel = supabase
      .channel('pixels-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pixels202508' },
        (payload) => {
          const { x, y, color } = payload.new;
          setPixels(prev => ({ ...prev, [`${x},${y}`]: color }));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    // Account for zoom and pan
    const x = Math.floor((clientX - panOffset.x) / (pixelSize * zoom));
    const y = Math.floor((clientY - panOffset.y) / (pixelSize * zoom));
    return { x, y };
  };

  const paintPixel = async (x, y) => {
    if (!canPlace) {
      return; // Don't allow placement during cooldown
    }

    const key = `${x},${y}`;
    setPixels(prev => ({ ...prev, [key]: selectedColor }));

    if (onPixelClick) onPixelClick({ x, y, color: selectedColor });

    // Start cooldown
    setCanPlace(false);
    setCooldown(1); //1 second cooldown

    try {
      // Call secure server endpoint instead of direct Supabase
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
      const response = await fetch(`${serverUrl}/place-pixel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ x, y, color: selectedColor })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Server error:', data.error);
        if (data.remainingTime) {
          // Server-side rate limit kicked in
          setCooldown(data.remainingTime);
        }
      }
    } catch (error) {
      console.error('Error placing pixel:', error);
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 1 || e.button === 2 || e.shiftKey || e.ctrlKey) {
      // Middle mouse, right click, or modifier key = pan
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else if (e.button === 0 && canPlace) {
      // Left click = place pixel
      const { x, y } = getMousePos(e);
      if (x >= 0 && x < columns && y >= 0 && y < rows) {
        paintPixel(x, y);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      // Hide tooltip when panning
      setTooltip(prev => ({ ...prev, visible: false }));
    } else {
      // Show tooltip
      const rect = canvasRef.current.getBoundingClientRect();
      const { x: pixelX, y: pixelY } = getMousePos(e);
      
      if (pixelX >= 0 && pixelX < columns && pixelY >= 0 && pixelY < rows) {
        const key = `${pixelX},${pixelY}`;
        const pixelColor = pixels[key] || '#ffffff';
        
        setTooltip({
          visible: true,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          pixelX,
          pixelY,
          color: pixelColor
        });
      } else {
        setTooltip(prev => ({ ...prev, visible: false }));
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };
  
  const handleMouseLeave = () => {
    setIsPanning(false);
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(0.1, zoom * delta), 10);
    
    // Zoom towards mouse position
    const scale = newZoom / zoom;
    setPanOffset(prev => ({
      x: mouseX - (mouseX - prev.x) * scale,
      y: mouseY - (mouseY - prev.y) * scale
    }));
    setZoom(newZoom);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 10);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);
  };

  const handleResetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };
  
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };
  
  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Dragging handlers
  const handleControlsMouseDown = (e) => {
    if (e.target.closest('.zoom-btn')) return; // Don't drag when clicking buttons
    setIsDraggingControls(true);
    setDragOffset({
      x: e.clientX - controlsPosition.x,
      y: e.clientY - controlsPosition.y
    });
  };
  
  const handlePaletteMouseDown = (e) => {
    if (e.target.closest('.palette-button')) return; // Don't drag when clicking color
    setIsDraggingPalette(true);
    setDragOffset({
      x: e.clientX - palettePosition.x,
      y: e.clientY - palettePosition.y
    });
  };
  
  const handleDragMove = (e) => {
    if (isDraggingControls) {
      const tempX = e.clientX - dragOffset.x;
      const tempY = e.clientY - dragOffset.y;
      
      // Pre-constrain to screen bounds with minimum dimensions
      const constrainedX = Math.max(0, Math.min(window.innerWidth - 90, tempX));
      const constrainedY = Math.max(0, Math.min(window.innerHeight - 90, tempY));
      
      // Determine layout based on constrained position
      const distanceFromSides = Math.min(constrainedX, window.innerWidth - constrainedX);
      const distanceFromTopBottom = Math.min(constrainedY, window.innerHeight - constrainedY);
      const isColumn = distanceFromSides < distanceFromTopBottom;
      
      // Controls dimensions based on layout
      const controlsWidth = isColumn ? 90 : 420;
      const controlsHeight = isColumn ? 320 : 90;
      
      // Apply final constraints with correct dimensions
      const finalX = Math.max(0, Math.min(window.innerWidth - controlsWidth, tempX));
      const finalY = Math.max(0, Math.min(window.innerHeight - controlsHeight, tempY));
      
      setControlsPosition({
        x: finalX,
        y: finalY
      });
    } else if (isDraggingPalette) {
      const tempX = e.clientX - dragOffset.x;
      const tempY = e.clientY - dragOffset.y;
      
      // Pre-constrain to screen bounds with minimum dimensions
      const constrainedX = Math.max(45, Math.min(window.innerWidth - 45, tempX));
      const constrainedY = Math.max(45, Math.min(window.innerHeight - 45, tempY));
      
      // Determine layout based on constrained position
      const distanceFromSides = Math.min(constrainedX, window.innerWidth - constrainedX);
      const distanceFromTopBottom = Math.min(constrainedY, window.innerHeight - constrainedY);
      const isColumn = distanceFromSides < distanceFromTopBottom;
      
      // Palette dimensions based on layout
      const paletteWidth = isColumn ? 90 : 630;
      const paletteHeight = isColumn ? 630 : 110;
      
      // Account for transform: translate(-50%, -50%)
      const minX = paletteWidth / 2;
      const maxX = window.innerWidth - paletteWidth / 2;
      const minY = paletteHeight / 2;
      const maxY = window.innerHeight - paletteHeight / 2;
      
      const finalX = Math.max(minX, Math.min(maxX, tempX));
      const finalY = Math.max(minY, Math.min(maxY, tempY));
      
      setPalettePosition({
        x: finalX,
        y: finalY
      });
    }
  };
  
  const handleDragEnd = () => {
    setIsDraggingControls(false);
    setIsDraggingPalette(false);
  };
  
  // Determine controls layout based on position
  const getControlsLayout = () => {
    // Calculate actual distance from each edge
    const distanceFromLeft = controlsPosition.x;
    const distanceFromRight = window.innerWidth - controlsPosition.x - 90; // Subtract min width
    const distanceFromTop = controlsPosition.y;
    const distanceFromBottom = window.innerHeight - controlsPosition.y - 90; // Subtract min height
    
    // Find minimum distance from sides vs top/bottom
    const minDistanceFromSides = Math.min(distanceFromLeft, distanceFromRight);
    const minDistanceFromTopBottom = Math.min(distanceFromTop, distanceFromBottom);
    
    // If closer to left/right edges than top/bottom, use column
    return minDistanceFromSides < minDistanceFromTopBottom ? 'column' : 'row';
  };
  
  // Determine palette layout based on position
  const getPaletteLayout = () => {
    // Calculate actual distance from each edge (accounting for transform -50%)
    const distanceFromLeft = palettePosition.x - 45; // Half of min width
    const distanceFromRight = window.innerWidth - palettePosition.x - 45;
    const distanceFromTop = palettePosition.y - 45;
    const distanceFromBottom = window.innerHeight - palettePosition.y - 45;
    
    // Find minimum distance from sides vs top/bottom
    const minDistanceFromSides = Math.min(distanceFromLeft, distanceFromRight);
    const minDistanceFromTopBottom = Math.min(distanceFromTop, distanceFromBottom);
    
    // If closer to left/right edges than top/bottom, use column
    return minDistanceFromSides < minDistanceFromTopBottom ? 'column' : 'row';
  };
  
  // Global mouse move and up for dragging
  useEffect(() => {
    if (isDraggingControls || isDraggingPalette) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDraggingControls, isDraggingPalette, dragOffset, controlsPosition, palettePosition]);

  return (
    <div className="canvas-container" ref={containerRef}>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Loading pixels...</p>
        </div>
      )}
      
      {/* Zoom Controls */}
      <div 
        className={`zoom-controls zoom-controls-${getControlsLayout()} ${isDraggingControls ? 'dragging' : ''}`}
        style={{
          left: `${controlsPosition.x}px`,
          top: `${controlsPosition.y}px`
        }}
        onMouseDown={handleControlsMouseDown}
      >
        <div className="drag-handle">☰</div>
        <button className="zoom-btn" onClick={handleZoomIn} title="Zoom In">+</button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button className="zoom-btn" onClick={handleZoomOut} title="Zoom Out">-</button>
        <button className="zoom-btn reset-btn" onClick={handleResetView} title="Reset View">⊙</button>
        <button 
          className="zoom-btn fullscreen-btn" 
          onClick={handleToggleFullscreen} 
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? '⊡' : '⊞'}
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`canvas ${!canPlace ? 'canvas-disabled' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        style={{ 
          display: loading ? 'none' : 'block',
          cursor: isPanning ? 'grabbing' : (canPlace ? 'crosshair' : 'not-allowed')
        }}
      />
      
      {/* Tooltip */}
      {tooltip.visible && (
        <div 
          className="pixel-tooltip"
          style={{
            left: `${tooltip.x + 15}px`,
            top: `${tooltip.y + 15}px`
          }}
        >
          <div className="tooltip-header">
            <span className="tooltip-label">PIXEL</span>
          </div>
          <div className="tooltip-content">
            <div className="tooltip-row">
              <span className="tooltip-key">X:</span>
              <span className="tooltip-value">{tooltip.pixelX}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-key">Y:</span>
              <span className="tooltip-value">{tooltip.pixelY}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-key">COLOR:</span>
              <span className="tooltip-value">{tooltip.color}</span>
            </div>
            <div className="tooltip-color-preview" style={{ backgroundColor: tooltip.color }} />
          </div>
        </div>
      )}
      
      {!canPlace && cooldown > 0 && (
        <div className="cooldown-indicator">
          <div className="cooldown-text">
            <span className="cooldown-label">Next pixel in:</span>
            <span className="cooldown-timer">{cooldown}s</span>
          </div>
          <div className="cooldown-bar">
            <div 
              className="cooldown-progress" 
              style={{ width: `${((15 - cooldown) / 15) * 100}%` }}
            />
          </div>
        </div>
      )}
      <Palette 
        onColorSelect={setSelectedColor} 
        selectedColor={selectedColor}
        position={palettePosition}
        isDragging={isDraggingPalette}
        onMouseDown={handlePaletteMouseDown}
        layout={getPaletteLayout()}
      />
    </div>
  );
}

export default Canvas;
