"use client";

import { useEffect, useRef } from "react";

const CHARS = [
  "0", "1", "0", "1", "1", "0",
  "git", "commit", "sha256", "PR#42", "diff", "HEAD", "merge",
  "RFC", "auth", "dossier", "HEAD", "main", "7f3a", "0x8F",
  "{", "}", "=>", ";", "/*", "*/", "[]", "++", "//", "&&",
];

interface Cell {
  x: number;
  y: number;
  char: string;
  charIndex: number;
  opacity: number;
  baseOpacity: number;
  highlight: number;
  speed: number;
  offset: number;
}

export default function InteractiveCodeMatrix({
  className = "",
  theme = "dark",
}: {
  className?: string;
  theme?: "dark" | "light";
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let mouse = { x: -9999, y: -9999, active: false, targetX: -9999, targetY: -9999 };
    let ambientTime = 0;

    const CELL_SIZE_X = 32;
    const CELL_SIZE_Y = 22;
    let cells: Cell[] = [];

    function resize() {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect() || {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx!.scale(dpr, dpr);

      // Rebuild cells
      cells = [];
      const cols = Math.ceil(width / CELL_SIZE_X) + 1;
      const rows = Math.ceil(height / CELL_SIZE_Y) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const charIndex = Math.floor(Math.random() * CHARS.length);
          cells.push({
            x: c * CELL_SIZE_X + 8,
            y: r * CELL_SIZE_Y + 16,
            char: CHARS[charIndex],
            charIndex,
            opacity: 0.08 + Math.random() * 0.1,
            baseOpacity: 0.08 + Math.random() * 0.08,
            highlight: 0,
            speed: 0.02 + Math.random() * 0.04,
            offset: Math.random() * Math.PI * 2,
          });
        }
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    }

    function onMouseLeave() {
      mouse.active = false;
    }

    function onTouchMove(e: TouchEvent) {
      if (!canvas || e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.touches[0].clientX - rect.left;
      mouse.targetY = e.touches[0].clientY - rect.top;
      mouse.active = true;
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    resize();

    // Render loop
    const RADIUS = 220;
    const RADIUS_SQ = RADIUS * RADIUS;

    function render() {
      if (!ctx || !canvas) return;

      ambientTime += 0.015;

      // Smooth mouse follow
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.15;
        mouse.y += (mouse.targetY - mouse.y) * 0.15;
      } else {
        // Ambient drifting cursor spotlight when idle
        mouse.x = width * 0.5 + Math.sin(ambientTime * 0.7) * (width * 0.35);
        mouse.y = height * 0.45 + Math.cos(ambientTime * 0.5) * (height * 0.25);
      }

      ctx.clearRect(0, 0, width, height);

      // Radial spotlight aura
      if (mouse.x > -500) {
        const glow = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          RADIUS * 1.2
        );
        if (theme === "dark") {
          glow.addColorStop(0, "rgba(16, 185, 129, 0.14)"); // Emerald core
          glow.addColorStop(0.35, "rgba(99, 102, 241, 0.08)"); // Indigo mid
          glow.addColorStop(0.7, "rgba(6, 182, 212, 0.03)"); // Cyan edge
          glow.addColorStop(1, "transparent");
        } else {
          glow.addColorStop(0, "rgba(16, 185, 129, 0.18)");
          glow.addColorStop(0.4, "rgba(99, 102, 241, 0.08)");
          glow.addColorStop(1, "transparent");
        }
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.font = '10.5px "JetBrains Mono", Consolas, Monaco, monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const now = performance.now();

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];

        // Distance to cursor
        const dx = cell.x - mouse.x;
        const dy = cell.y - mouse.y;
        const distSq = dx * dx + dy * dy;

        let targetHighlight = 0;
        if (distSq < RADIUS_SQ) {
          const dist = Math.sqrt(distSq);
          targetHighlight = 1 - dist / RADIUS;
          targetHighlight = targetHighlight * targetHighlight; // Quad falloff
        }

        cell.highlight += (targetHighlight - cell.highlight) * 0.18;

        // Subtle organic breathing
        const breath = Math.sin(ambientTime * 2 + cell.offset) * 0.03;
        const alpha = Math.min(1, Math.max(0.04, cell.baseOpacity + breath + cell.highlight * 0.85));

        // When illuminated by mouse, occasionally glitch/cycle characters
        if (cell.highlight > 0.4 && Math.random() < 0.06) {
          cell.charIndex = (cell.charIndex + 1) % CHARS.length;
          cell.char = CHARS[cell.charIndex];
        }

        // Color interpolation based on highlight
        if (theme === "dark") {
          if (cell.highlight > 0.6) {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`; // Bright center
          } else if (cell.highlight > 0.25) {
            ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`; // Emerald matrix green
          } else if (cell.highlight > 0.05) {
            ctx.fillStyle = `rgba(129, 140, 248, ${alpha})`; // Violet/indigo
          } else {
            ctx.fillStyle = `rgba(161, 161, 170, ${alpha * 0.7})`; // Dim zinc
          }
        } else {
          if (cell.highlight > 0.5) {
            ctx.fillStyle = `rgba(5, 150, 105, ${alpha})`; // Deep emerald
          } else if (cell.highlight > 0.2) {
            ctx.fillStyle = `rgba(79, 70, 229, ${alpha})`; // Indigo
          } else {
            ctx.fillStyle = `rgba(113, 113, 122, ${alpha * 0.6})`; // Muted grey
          }
        }

        ctx.fillText(cell.char, cell.x, cell.y);
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      cancelAnimationFrame(animId);
    };
  }, [theme]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full block" />
    </div>
  );
}
