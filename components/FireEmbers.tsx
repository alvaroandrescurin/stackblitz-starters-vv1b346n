
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';

export default function FireEmbers() {
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

    interface Ember {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      life: number;
      color: string;
    }

    let embers: Ember[] = [];
    const colors = ['#ff4d00', '#ff8c00', '#ffae00', '#e25822'];

    const createEmber = (): Ember => ({
      x: Math.random() * width,
      y: height + 10,
      size: Math.random() * 2 + 1,
      speedY: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.5 + 0.5,
      life: Math.random() * 100 + 100,
      color: colors[Math.floor(Math.random() * colors.length)]
    });

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      if (embers.length < 60) {
        embers.push(createEmber());
      }

      embers = embers.filter(ember => {
        ember.y -= ember.speedY;
        ember.x += ember.speedX + Math.sin(ember.y / 30) * 0.5;
        ember.life -= 1;
        
        if (ember.life <= 0 || ember.y < -20) return false;

        ctx.globalAlpha = (ember.life / 200) * ember.opacity;
        ctx.fillStyle = ember.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = ember.color;
        
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
        ctx.fill();
        
        return true;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

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
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
