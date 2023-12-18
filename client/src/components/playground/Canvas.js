import React, { useRef, useEffect } from "react"
import PropTypes from "prop-types"

const Canvas = ({ draw, height, width }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    console.log('Canvas useEffect - draw:', draw)
    const canvas = canvasRef.current

    if (!canvas) {
      console.error("Canvas element not found.")
      return
    }

    const ctx = canvas.getContext("2d")
    if (ctx) {
      draw(ctx);
    } else {
      console.error("2D context not available.")
    }
  }, [draw])

  return <canvas ref={canvasRef} height={height} width={width} />
};

Canvas.propTypes = {
  draw: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired
};

export default Canvas;
