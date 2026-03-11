import { useRef, useEffect, useCallback } from 'react';
import { Balloon, DictCategory } from '../types';
import { lightenColor } from '../lib/game';
import './Canvas.css';

interface CanvasProps {
  balloons: Balloon[];
  categories: DictCategory[];
  canvasWidth: number;
  canvasHeight: number;
}

export function GameCanvas({ balloons, categories, canvasWidth, canvasHeight }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sky background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#e0f7fa');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    drawClouds(ctx, canvas.width, canvas.height);

    // Draw balloons
    balloons.forEach(balloon => {
      drawBalloon(ctx, balloon, categories);
    });
  }, [balloons, categories]);

  // Redraw when balloons change
  useEffect(() => {
    draw();
  }, [draw]);

  // Set canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }
    draw();
  }, [canvasWidth, canvasHeight, draw]);

  return (
    <canvas 
      ref={canvasRef} 
      className="game-canvas"
      width={canvasWidth}
      height={canvasHeight}
    />
  );
}

function drawClouds(ctx: CanvasRenderingContext2D, width: number, _height: number) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  const time = Date.now() * 0.0001;
  
  for (let i = 0; i < 5; i++) {
    const x = ((i * 200 + time * 50) % (width + 200)) - 100;
    const y = 50 + Math.sin(i) * 30;
    
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 10, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBalloon(ctx: CanvasRenderingContext2D, balloon: Balloon, categories: DictCategory[]) {
  const { x, y, word, popped, scale } = balloon;
  
  // Get category color
  const category = categories.find(c => c.id === word.category);
  const color = category?.color || '#ff6b6b';
  
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  if (popped) {
    // Draw burst effect
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = 20 * (1 - scale);
      ctx.beginPath();
      ctx.arc(
        Math.cos(angle) * dist,
        Math.sin(angle) * dist,
        10 * scale,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    ctx.restore();
    return;
  }

  // Balloon body
  const gradient = ctx.createRadialGradient(0, -20, 0, 0, 0, 50);
  gradient.addColorStop(0, lightenColor(color, 30));
  gradient.addColorStop(1, color);
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, 45, 55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.ellipse(-15, -20, 10, 15, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // String
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 50);
  ctx.quadraticCurveTo(Math.sin(balloon.wobble) * 10, 70, 0, 90);
  ctx.stroke();

  // Chinese character
  ctx.fillStyle = 'white';
  ctx.font = 'bold 28px "Noto Sans SC", "ZCOOL XiaoWei", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 4;
  ctx.fillText(word.chinese, 0, -5);

  ctx.restore();
}