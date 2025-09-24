/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState, useEffect } from "react";
import Palette from "../Palette/Palette";
import supabase from "../../hook/supabaseClient"; 

import './Canvas.css';

function Canvas({ width = 500, height = 500, pixelSize = 10, onPixelClick }) {
  const canvasRef = useRef(null);
  const [pixels, setPixels] = useState({}); 
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [loading, setLoading] = useState(true); // new loading state

  const columns = Math.floor(width / pixelSize);
  const rows = Math.floor(height / pixelSize);

  const drawGrid = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    Object.entries(pixels).forEach(([key, color]) => {
      const [x, y] = key.split(",").map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    });

    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 0.3;
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
  };

  useEffect(() => {
    drawGrid();
  }, [pixels]);

  useEffect(() => {
    const loadPixels = async () => {
      setLoading(true); // start loading
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
      setLoading(false); // finished loading
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
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);
    return { x, y };
  };

  const paintPixel = async (x, y) => {
    const key = `${x},${y}`;
    setPixels(prev => ({ ...prev, [key]: selectedColor }));

    if (onPixelClick) onPixelClick({ x, y, color: selectedColor });

    const { error } = await supabase
      .from('pixels202508')
      .upsert({ x, y, color: selectedColor, updated_by: 'guest' });
    if (error) console.error("Error saving pixel:", error);
  };

  const handleMouseDown = (e) => {
    const { x, y } = getMousePos(e);
    paintPixel(x, y);
  };

  return (
    <div className="canvas-container">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Loading pixels...</p>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="canvas"
        onMouseDown={handleMouseDown}
        style={{ display: loading ? 'none' : 'block' }}
      />
      <Palette onColorSelect={setSelectedColor} selectedColor={selectedColor} />
    </div>
  );
}

export default Canvas;
