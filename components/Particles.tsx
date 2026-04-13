import React, { useRef, useEffect } from 'react';

interface ParticlesProps {
  className?: string;
  particleColors?: string[];
  particleCount?: number;
  particleBaseSize?: number;
  // Keep these props to prevent TypeScript errors from existing usage, 
  // even if unused in this 2D implementation
  particleSpread?: number;
  speed?: number;
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  sizeRandomness?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
}

const Particles: React.FC<ParticlesProps> = ({ 
  className,
  particleColors = ['#4338ca', '#6366f1', '#0ea5e9'],
  particleCount = 100,
  particleBaseSize = 3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    let animationFrameId: number;
    let mouseX: number | null = null;
    let mouseY: number | null = null;
    
    // Handle DPI for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    
    const initCanvas = () => {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    };
    
    initCanvas();

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * particleBaseSize + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
        this.alpha = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.x > width) this.x = 0;
        else if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        else if (this.y < 0) this.y = height;

        // Mouse interaction (gentle avoidance)
        if (mouseX !== null && mouseY !== null) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const interactionRadius = 150;
            
            if (distance < interactionRadius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (interactionRadius - distance) / interactionRadius;
                // Move away gently
                this.x -= forceDirectionX * force * 1.5;
                this.y -= forceDirectionY * force * 1.5;
            }
        }
      }

      draw() {
        if (!ctx) return;
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }

    const particlesArray: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
        particlesArray.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particlesArray.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
        initCanvas();
    };

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
        mouseX = null;
        mouseY = null;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleColors, particleCount, particleBaseSize]);

  return <canvas ref={canvasRef} className={`${className} block`} style={{ touchAction: 'none' }} />;
};

export default Particles;