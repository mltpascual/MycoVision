
import React, { useRef, useEffect, useState } from 'react';

interface KaleidoscopeProps {
  imageSrc: string;
  onClose: () => void;
  onRegenerate: () => void;
  isGenerating: boolean;
}

export const Kaleidoscope: React.FC<KaleidoscopeProps> = ({ imageSrc, onClose, onRegenerate, isGenerating }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [segments, setSegments] = useState(12);
  const [isMuted, setIsMuted] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Audio Setup: Immersive psychedelic ambient drone
    const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audio.play().catch(e => console.log("Audio autoplay blocked, requires interaction"));
    audioRef.current = audio;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
    };

    const handleResize = () => {
      if (canvasRef.current) {
        // High DPI Support
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = window.innerWidth * dpr;
        canvasRef.current.height = window.innerHeight * dpr;
        canvasRef.current.style.width = `${window.innerWidth}px`;
        canvasRef.current.style.height = `${window.innerHeight}px`;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
      audio.pause();
      audio.src = '';
    };
  }, [imageSrc]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const img = imgRef.current;

      if (canvas && ctx && img) {
        const dpr = window.devicePixelRatio || 1;
        const time = (Date.now() - startTimeRef.current) * 0.001;
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.sqrt(width * width + height * height);
        const step = (Math.PI * 2) / segments;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        
        // FIX BLUR: High quality rendering settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const numLayers = 12; // More layers for smoother depth
        const zoomSpeed = 0.15; // Slower for more "trip" feel
        const globalZoom = (time * zoomSpeed) % 1;

        for (let l = 0; l < numLayers; l++) {
          const layerProgress = (l - globalZoom) / numLayers;
          const scale = Math.pow(2.2, (1 - layerProgress) * 5);
          
          let opacity = Math.sin(layerProgress * Math.PI);
          opacity = Math.max(0, opacity);

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.globalAlpha = opacity;
          
          ctx.rotate(time * 0.03 + (l * 0.08));
          ctx.scale(scale, scale);

          for (let i = 0; i < segments; i++) {
            ctx.save();
            ctx.rotate(i * step);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(radius / scale, -Math.tan(step / 2) * (radius / scale));
            ctx.lineTo(radius / scale, Math.tan(step / 2) * (radius / scale));
            ctx.closePath();
            ctx.clip();

            if (i % 2 === 1) ctx.scale(1, -1);

            // Tiling Logic to prevent blurriness
            // Instead of stretching one image, we draw it at its natural high-detail size
            const textureScale = 0.5 / dpr; // Scale factor for the texture density
            const driftX = Math.sin(time * 0.1) * 200;
            const driftY = (time * 150) % img.height;

            // Draw multiple tiles to ensure no gaps during high-speed travel
            const drawW = img.width * textureScale;
            const drawH = img.height * textureScale;

            for (let x = 0; x < 2; x++) {
              for (let y = -1; y < 2; y++) {
                ctx.drawImage(
                  img,
                  (x * drawW) - (drawW / 2) + (driftX * textureScale),
                  (y * drawH) - (drawH / 2) + (driftY * textureScale),
                  drawW,
                  drawH
                );
              }
            }

            ctx.restore();
          }
          ctx.restore();
        }

        // Deep vignette for focus
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0.1)');
        grad.addColorStop(1, 'rgba(0,0,0,0.95)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Chromatic aberration-ish effect (simple overlay)
        ctx.globalCompositeOperation = 'screen';
        const pulse = Math.sin(time) * 5;
        ctx.fillStyle = 'rgba(255, 0, 100, 0.02)';
        ctx.fillRect(pulse, 0, width, height);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.02)';
        ctx.fillRect(-pulse, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
      }
      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current);
  }, [segments, imageSrc]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="cursor-none" />
      
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>

      {/* Top Controls */}
      <div className="absolute top-8 left-8 right-8 z-[110] flex justify-between items-start">
        <div className="flex gap-4">
          <button 
            onClick={onRegenerate}
            disabled={isGenerating}
            className={`px-8 py-3 rounded-full glass border border-white/20 text-white font-bold uppercase tracking-[0.3em] text-[11px] transition-all flex items-center gap-3 ${isGenerating ? 'opacity-50' : 'hover:bg-white hover:text-black hover:scale-105 shadow-[0_0_25px_rgba(255,255,255,0.2)]'}`}
          >
            {isGenerating ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : '✧'} Shift Reality
          </button>

          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-12 h-12 rounded-full glass border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-all"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
        
        <button 
          onClick={onClose}
          className="px-6 py-3 rounded-full glass border border-white/20 text-white/40 font-bold uppercase tracking-widest text-[10px] hover:text-white hover:border-white transition-all"
        >
          Exit Tunnel
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-12 left-0 right-0 z-[110] flex flex-col items-center gap-8">
        <div className="flex gap-4 p-2 glass rounded-full border border-white/10 backdrop-blur-3xl">
          {[6, 12, 18, 24, 32].map(n => (
            <button 
              key={n}
              onClick={() => setSegments(n)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${segments === n ? 'bg-white text-black scale-110 shadow-[0_0_30px_rgba(255,255,255,0.5)]' : 'text-white/30 hover:text-white'}`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="text-center space-y-2">
          <p className="text-white/20 text-[9px] uppercase tracking-[1em] font-black">Harmonic Symmetry</p>
          <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto"></div>
        </div>
      </div>
    </div>
  );
};
