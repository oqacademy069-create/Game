export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'square' | 'spark';
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  scale: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  lineWidth: number;
  alpha: number;
}

export class ParticleSystem {
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public shockwaves: Shockwave[] = [];

  public update(dt: number): void {
    const safeDt = Math.max(0, Math.min(isNaN(dt) ? 0.016 : dt, 0.05));

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * safeDt * 60;
      p.y += p.vy * safeDt * 60;
      p.vx *= 0.94; // friction
      p.vy *= 0.94;
      p.life -= safeDt;
      p.alpha = Math.max(0, Math.min(1, p.life / p.maxLife));

      if (p.life <= 0 || isNaN(p.x) || isNaN(p.y)) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= safeDt * 30; // float upwards
      ft.life -= safeDt;
      ft.alpha = Math.max(0, Math.min(1, ft.life / ft.maxLife));
      ft.scale = 1 + (1 - ft.alpha) * 0.3;

      if (ft.life <= 0 || isNaN(ft.y)) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      const expansion = Math.max(0, sw.maxRadius - sw.radius) * safeDt * 8;
      sw.radius = Math.max(0, sw.radius + expansion);
      sw.alpha = Math.max(0, Math.min(1, 1 - sw.radius / Math.max(1, sw.maxRadius)));

      if (sw.radius >= sw.maxRadius * 0.95 || sw.radius <= 0 || isNaN(sw.radius)) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Render shockwaves
    for (const sw of this.shockwaves) {
      const r = Math.max(0.5, sw.radius);
      if (!isFinite(r) || sw.alpha <= 0) continue;
      
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = Math.max(0.5, sw.lineWidth * sw.alpha);
      ctx.globalAlpha = Math.max(0, Math.min(1, sw.alpha * 0.8));
      ctx.stroke();
    }

    // Render particles
    for (const p of this.particles) {
      const alpha = Math.max(0, Math.min(1, p.alpha));
      if (alpha <= 0) continue;
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      const size = Math.max(0.5, p.size * alpha);
      if (p.shape === 'square') {
        const half = size / 2;
        ctx.fillRect(p.x - half, p.y - half, size, size);
      } else if (p.shape === 'spark') {
        ctx.beginPath();
        const rx = Math.max(0.5, size);
        const ry = Math.max(0.2, size * 0.4);
        ctx.ellipse(p.x, p.y, rx, ry, Math.atan2(p.vy, p.vx), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Render floating texts
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = ft.alpha;
      ctx.font = `bold ${Math.round(14 * ft.scale)}px 'Chakra Petch', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Text drop shadow / outline
      ctx.fillStyle = '#090d16';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
      
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    ctx.restore();
  }

  public emitFoodBurst(x: number, y: number, color: string, count = 16): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 3,
        alpha: 1,
        life: 0.35 + Math.random() * 0.25,
        maxLife: 0.6,
        shape: Math.random() > 0.4 ? 'circle' : 'spark',
      });
    }

    this.shockwaves.push({
      x,
      y,
      radius: 4,
      maxRadius: 28,
      color,
      lineWidth: 3,
      alpha: 1,
    });
  }

  public emitTrail(x: number, y: number, color: string): void {
    if (this.particles.length > 200) return; // avoid excess
    this.particles.push({
      x: x + (Math.random() - 0.5) * 4,
      y: y + (Math.random() - 0.5) * 4,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      color,
      size: 2 + Math.random() * 2,
      alpha: 0.6,
      life: 0.25,
      maxLife: 0.25,
      shape: 'circle',
    });
  }

  public emitCrashDebris(snakeSegments: { x: number; y: number }[], tileSize: number, color: string): void {
    snakeSegments.forEach((seg, idx) => {
      const centerX = seg.x * tileSize + tileSize / 2;
      const centerY = seg.y * tileSize + tileSize / 2;
      const count = idx === 0 ? 12 : 4;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        this.particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: 3 + Math.random() * 4,
          alpha: 1,
          life: 0.5 + Math.random() * 0.5,
          maxLife: 1.0,
          shape: 'square',
        });
      }
    });

    if (snakeSegments.length > 0) {
      const head = snakeSegments[0];
      this.shockwaves.push({
        x: head.x * tileSize + tileSize / 2,
        y: head.y * tileSize + tileSize / 2,
        radius: 6,
        maxRadius: 65,
        color: '#ef4444',
        lineWidth: 4,
        alpha: 1,
      });
    }
  }

  public addFloatingText(x: number, y: number, text: string, color = '#ffffff'): void {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      life: 0.8,
      maxLife: 0.8,
      scale: 1,
    });
  }

  public clear(): void {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
  }
}
