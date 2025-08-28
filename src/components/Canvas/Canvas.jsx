/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState, useEffect } from "react"
import Palette from "../Palette/Palette"
import './Canvas.css'

function Canvas({ width = 500, height = 500, pixelSize = 10, onPixelClick }) {
  const canvasRef = useRef(null)
  const [pixels, setPixels] = useState({}) 
  const [selectedColor, setSelectedColor] = useState("#000000")


  const columns = Math.floor(width / pixelSize)
  const rows = Math.floor(height / pixelSize)

  const drawGrid = () => {
    const ctx = canvasRef.current.getContext("2d")
    ctx.clearRect(0, 0, width, height)

    Object.entries(pixels).forEach(([key, color]) => {
      const [x, y] = key.split(",").map(Number)
      ctx.fillStyle = color
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    })

    ctx.strokeStyle = "#ccc"
    ctx.lineWidth = 0.5
    for (let x = 0; x <= columns; x++) {
      ctx.beginPath()
      ctx.moveTo(x * pixelSize, 0)
      ctx.lineTo(x * pixelSize, height)
      ctx.stroke()
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * pixelSize)
      ctx.lineTo(width, y * pixelSize)
      ctx.stroke()
    }
  }

  useEffect(() => {
    drawGrid()
  }, [pixels])

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / pixelSize)
    const y = Math.floor((e.clientY - rect.top) / pixelSize)
    return { x, y }
  }

  const paintPixel = (x, y) => {
    const key = `${x},${y}`
    setPixels((prev) => {
      const newPixels = { ...prev, [key]: selectedColor }
      return newPixels
    })
    if (onPixelClick) onPixelClick({ x, y, color: selectedColor })
  }

  const handleMouseDown = (e) => {
    const { x, y } = getMousePos(e)
    paintPixel(x, y)
  }

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="canvas"
        onMouseDown={handleMouseDown}
      />

      <Palette onColorSelect={setSelectedColor} selectedColor={selectedColor} />  
    </div>
  )
}


export default Canvas;