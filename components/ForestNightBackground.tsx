/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';

export default function ForestNightBackground() {
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

    // Layer 3: Windy Trees
    const backgroundTrees = Array.from({ length: 15 }, () => ({
      x: Math.random() * width,
      w: 40 + Math.random() * 80,
      h: height * 0.4 + Math.random() * height * 0.4,
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: 0.001 + Math.random() * 0.002,
      opacity: 0.8
    }));

    // Layer 2: Twitching Shrubs
    const shrubs = Array.from({ length: 12 }, () => ({
      x: Math.random() * width,
      w: 100 + Math.random() * 200,
      h: 40 + Math.random() * 60,
      twitchTime: 0,
      nextTwitch: Math.random() * 5000,
      opacity: 0.9
    }));

    // Layer 1: Mist
    const mistBlobs = Array.from({ length: 5 }, () => ({
      x: Math.random() * width,
      y: height * 0.5 + Math.random() * height * 0.5,
      vx: 0.2 + Math.random() * 0.5,
      radius: 300 + Math.random() * 400
    }));

    const draw = (time: number) => {
      // LAYER 4: Moonlight & Sky
      ctx.fillStyle = '#010103';
      ctx.fillRect(0, 0, width, height);

      // Intense Moonlight Glow
      const moonGrad = ctx.createRadialGradient(width * 0.8, height * 0.1, 0, width * 0.8, height * 0.1, width * 0.7);
      moonGrad.addColorStop(0, 'rgba(40, 50, 100, 0.25)');
      moonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = moonGrad;
      ctx.fillRect(0, 0, width, height);

      // LAYER 3: Windy Trees
      backgroundTrees.forEach(tree => {
        const sway = Math.sin(time * tree.swaySpeed + tree.swayOffset) * 20;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(tree.x, height);
        ctx.lineTo(tree.x - tree.w / 2, height);
        ctx.bezierCurveTo(
          tree.x - 10 + sway, height - tree.h * 0.5,
          tree.x + 10 + sway, height - tree.h * 0.8,
          tree.x + sway, height - tree.h
        );
        ctx.bezierCurveTo(
          tree.x + 20 + sway, height - tree.h * 0.8,
          tree.x + tree.w / 2 + sway, height - tree.h * 0.5,
          tree.x + tree.w / 2, height
        );
        ctx.fill();
      });

      // LAYER 2: Twitching Shrubs
      shrubs.forEach(s => {
        let rustle = 0;
        if (time > s.nextTwitch) {
            rustle = Math.sin(time * 0.1) * 5;
            if (time > s.nextTwitch + 300) {
                s.nextTwitch = time + 2000 + Math.random() * 8000;
            }
        }
        ctx.fillStyle = '#030303';
        ctx.beginPath();
        ctx.ellipse(s.x + rustle, height - 10, s.w / 2, s.h, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // LAYER 1: Mist
      ctx.globalCompositeOperation = 'screen';
      mistBlobs.forEach(m => {
        m.x += m.vx;
        if (m.x > width + m.radius) m.x = -m.radius;
        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius);
        grad.addColorStop(0, 'rgba(30, 40, 60, 0.08)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });
      ctx.globalCompositeOperation = 'source-over';

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
        background: '#000'
      }}
    />
  );
}
