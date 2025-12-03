"use client";

import { useEffect, useRef } from "react";

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Matrix rain configuration
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    function draw() {
      if (!ctx || !canvas) return;

      // Semi-transparent black background for trail effect
      // Occasionally vary opacity for flickering background
      const bgOpacity = Math.random() > 0.99 ? 0.2 : 0.05;
      ctx.fillStyle = `rgba(0, 0, 0, ${bgOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px JetBrains Mono, monospace`;

      // Random horizontal glitch (tearing)
      if (Math.random() > 0.98) {
        const y = Math.random() * canvas.height;
        const h = 20 + Math.random() * 50;
        const offset = (Math.random() - 0.5) * 20;
        try {
          const imageData = ctx.getImageData(0, y, canvas.width, h);
          ctx.putImageData(imageData, offset, y);
        } catch {
          // Ignore cross-origin issues if any (though shouldn't happen on local canvas)
        }
      }

      for (let i = 0; i < drops.length; i++) {
        // Randomly skip columns to create "dead" zones or stutter
        if (Math.random() > 0.995) continue;

        // Only 0s and 1s
        const text = Math.random() > 0.5 ? "1" : "0";

        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Glitchy coloring
        const isGlitch = Math.random() > 0.99;
        if (isGlitch) {
          ctx.fillStyle = "#fff"; // White flash
          ctx.shadowBlur = 5;
          ctx.shadowColor = "#fff";
        } else {
          ctx.fillStyle = "#00ff41";
          ctx.shadowBlur = 0;
        }

        ctx.fillText(text, x, y);

        // Reset drop to top randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Variable speed for "faulty" feel
        if (Math.random() > 0.1) {
          drops[i]++;
        }
      }
    }

    const interval = setInterval(draw, 33);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        opacity: 0.6,
        pointerEvents: "none",
      }}
    />
  );
}
