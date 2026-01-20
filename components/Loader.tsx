"use client";

import { useEffect, useRef } from "react";

interface LogoOrbitLoaderProps {
  size?: number;
  showBackground?: boolean;
  backgroundColor?: string;
}

export default function LogoOrbitLoader({
  size = 60,
  showBackground = false,
  backgroundColor = "rgba(0,0,0,0.85)",
}: LogoOrbitLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let start = performance.now();
    const center = size / 2;
    const radius = size / 2 - 4;

    const animate = (time: number) => {
      const progress = ((time - start) / 2000) % 1;

      ctx.clearRect(0, 0, size, size);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.arc(
        center,
        center,
        radius,
        progress * Math.PI * 2,
        progress * Math.PI * 2 + Math.PI * 0.9
      );
      ctx.stroke();

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [size]);

  return (
    <div
      style={{
        position: showBackground ? "fixed" : "relative",
        inset: showBackground ? 0 : undefined,
        background: showBackground ? backgroundColor : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div style={{ width: size, height: size, position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{ position: "absolute", inset: 0 }}
        />

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            style={{
              width: size / 2,
              height: size / 2,
              background: "#fff",
              borderRadius: "50%",
              animation: "orbitPulse 2s ease-in-out infinite",
              transformOrigin: "center center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20%",
              boxSizing: "border-box",
            }}
          >
            <img
              src="/images/xedla_png_logo.png"
              alt="Xedla"
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
