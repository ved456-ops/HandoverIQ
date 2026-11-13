"use client";

import { useEffect, useRef } from "react";

// Monospaced characters, binary digits, and code tokens matching the Greptile aesthetic
const CHARS = [
  "0", "1", "0", "1", "1", "0", "0", "1",
  "a", "b", "c", "d", "e", "f", "8", "9",
  "&", "*", "+", "w", "q", "p", "m", "s",
  "?", "!", ">", "<", "#", "{", "}", "[",
  "]", "~", "/", "\\", "_", "=", "%", "$"
];

interface Cell {
  x: number;
  y: number;
  char: string;
  charIndex: number;
  opacity: number;
  baseOpacity: number;
  highlight: number;
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

    // Tight uniform monospaced grid (like Greptile)
    const CELL_SIZE_X = 18;
    const CELL_SIZE_Y = 18;
    let cells: Cell[] = [];

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      const rect = parent ? parent.getBoundingClientRect() : {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(rect.width, 300);
      height = Math.max(rect.height, 200);
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
            x: c * CELL_SIZE_X + CELL_SIZE_X / 2,
            y: r * CELL_SIZE_Y + CELL_SIZE_Y / 2,
            char: CHARS[charIndex],
            charIndex,
            opacity: 0.04 + Math.random() * 0.05,
            baseOpacity: 0.04 + Math.random() * 0.04,
            highlight: 0,
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

    // Bind mouse listeners to the container
    const container = canvas.parentElement || window;
    container.addEventListener("mousemove", onMouseMove as EventListener);
    container.addEventListener("mouseleave", onMouseLeave as EventListener);
    container.addEventListener("touchmove", onTouchMove as EventListener, { passive: true });
    window.addEventListener("resize", resize);

    resize();

    // Spotlight radius
    const RADIUS = 200;
    const RADIUS_SQ = RADIUS * RADIUS;

    function render() {
      if (!ctx || !canvas) return;

      ambientTime += 0.012;

      // Smooth mouse tracking
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.18;
        mouse.y += (mouse.targetY - mouse.y) * 0.18;
      } else {
        // Subtle ambient drifting spotlight when cursor isn't hovering
        mouse.x = width * 0.5 + Math.sin(ambientTime * 0.6) * (width * 0.3);
        mouse.y = height * 0.45 + Math.cos(ambientTime * 0.45) * (height * 0.22);
      }

      ctx.clearRect(0, 0, width, height);

      // Radial spotlight aura
      if (mouse.x > -500 && mouse.x < width + 500) {
        const glow = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          RADIUS * 1.3
        );
        if (theme === "dark") {
          glow.addColorStop(0, "rgba(56, 189, 248, 0.12)"); // Cyan core
          glow.addColorStop(0.35, "rgba(99, 102, 241, 0.07)"); // Indigo mid
          glow.addColorStop(0.7, "rgba(16, 185, 129, 0.03)"); // Emerald edge
          glow.addColorStop(1, "transparent");
        } else {
          glow.addColorStop(0, "rgba(99, 102, 241, 0.10)");
          glow.addColorStop(0.4, "rgba(16, 185, 129, 0.05)");
          glow.addColorStop(1, "transparent");
        }
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.font = '10px "JetBrains Mono", Menlo, Consolas, Monaco, monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

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
          targetHighlight = targetHighlight * targetHighlight; // Smooth quad falloff
        }

        cell.highlight += (targetHighlight - cell.highlight) * 0.2;

        // Subtle organic breathing
        const breath = Math.sin(ambientTime * 1.5 + cell.offset) * 0.02;
        const alpha = Math.min(1, Math.max(0.02, cell.baseOpacity + breath + cell.highlight * 0.88));

        // When illuminated by mouse, occasionally glitch/cycle characters
        if (cell.highlight > 0.35 && Math.random() < 0.04) {
          cell.charIndex = (cell.charIndex + 1) % CHARS.length;
          cell.char = CHARS[cell.charIndex];
        }

        // Color interpolation based on highlight
        if (theme === "dark") {
          if (cell.highlight > 0.65) {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`; // Bright crisp center
          } else if (cell.highlight > 0.35) {
            ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`; // Glowing cyan
          } else if (cell.highlight > 0.1) {
            ctx.fillStyle = `rgba(129, 140, 248, ${alpha})`; // Indigo/violet
          } else {
            ctx.fillStyle = `rgba(148, 163, 184, ${alpha * 0.65})`; // Muted slate
          }
        } else {
          if (cell.highlight > 0.5) {
            ctx.fillStyle = `rgba(15, 23, 42, ${alpha})`; // Dark slate
          } else if (cell.highlight > 0.2) {
            ctx.fillStyle = `rgba(79, 70, 229, ${alpha})`; // Indigo
          } else {
            ctx.fillStyle = `rgba(148, 163, 184, ${alpha * 0.5})`; // Muted slate
          }
        }

        ctx.fillText(cell.char, cell.x, cell.y);
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      container.removeEventListener("mousemove", onMouseMove as EventListener);
      container.removeEventListener("mouseleave", onMouseLeave as EventListener);
      container.removeEventListener("touchmove", onTouchMove as EventListener);
      window.removeEventListener("resize", resize);
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
