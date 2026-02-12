/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';

export default function AtmosphericBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width: number;
    let height: number;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = (time: number) => {
      // Background base - not pure black, deep midnight
      ctx.fillStyle = '#020205';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0005;

      // Draw "Una sola ola" (A single wave)
      // This is a large, soft, atmospheric gradient wave
      ctx.beginPath();
      ctx.moveTo(0, height);

      // Create a smooth curve
      const amplitude = height * 0.15;
      const frequency = 0.002;
      const yOffset = height * 0.6;

      ctx.lineTo(0, yOffset + Math.sin(t) * amplitude);

      for (let x = 0; x <= width; x += 10) {
        const y = yOffset + 
                  Math.sin(x * frequency + t) * amplitude + 
                  Math.cos(x * frequency * 0.5 - t * 0.8) * (amplitude * 0.5);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      // Atmospheric Gradient for the single wave
      const grad = ctx.createLinearGradient(0, height * 0.4, 0, height);
      grad.addColorStop(0, 'rgba(30, 40, 90, 0.15)'); // Deep blue/indigo top
      grad.addColorStop(0.5, 'rgba(15, 10, 30, 0.4)'); // Purple middle
      grad.addColorStop(1, 'rgba(2, 2, 5, 1)');      // Dark bottom
      
      ctx.fillStyle = grad;
      ctx.fill();

      // Add a single soft light glow (the "sola" element)
      const glowX = width * 0.5 + Math.sin(t * 0.5) * (width * 0.2);
      const glowY = height * 0.4 + Math.cos(t * 0.3) * (height * 0.1);
      const glowGrad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, width * 0.6);
      glowGrad.addColorStop(0, 'rgba(40, 60, 120, 0.1)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw(0);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#020205'
      }}
    />
  );
}
