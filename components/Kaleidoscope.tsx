
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
  const [hasInteracted, setHasInteracted] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // High-quality, stable, calming ambient soundscape (Piano & Pads)
    const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); 
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
    };

    const handleResize = () => {
      if (canvasRef.current) {
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
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [imageSrc]);

  const handleStart = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error("Audio playback error:", err);
      });
    }
    setHasInteracted(true);
  };

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

        ctx.fillStyle = '#010101';
        ctx.fillRect(0, 0, width, height);
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const numLayers = 10;
        const zoomSpeed = 0.03; // Very slow and hypnotic
        const globalZoom = (time * zoomSpeed) % 1;

        for (let l = 0; l < numLayers; l++) {
          const layerProgress = (l - globalZoom) / numLayers;
          const scale = Math.pow(3.8, (1 - layerProgress) * 4);
          
          let opacity = Math.sin(layerProgress * Math.PI);
          opacity = Math.pow(Math.max(0, opacity), 2);

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.globalAlpha = opacity * 0.8;
          
          ctx.rotate(time * 0.006 + (l * 0.08) + Math.sin(time * 0.1) * 0.04);
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

            const textureScale = 0.75 / dpr; 
            const driftX = Math.sin(time * 0.02) * 150;
            const driftY = (time * 25) % img.height;

            ctx.drawImage(
              img,
              -(img.width * textureScale / 2) + (driftX * textureScale),
              -(img.height * textureScale / 2) + (driftY * textureScale),
              img.width * textureScale,
              img.height * textureScale
            );
            ctx.restore();
          }
          ctx.restore();
        }

        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.85, 'rgba(0,0,0,0.6)');
        grad.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current);
  }, [segments, imageSrc]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
      {!hasInteracted && (
        <div className="absolute inset-0 z-[150] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-6 transition-all duration-1000">
          <button 
            onClick={handleStart}
            className="group relative flex flex-col items-center"
          >
            <div className="w-32 h-32 rounded-full border border-pink-500/20 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-pink-500/40 transition-all duration-1000 shadow-[0_0_60px_rgba(236,72,153,0.05)]">
              <span className="text-5xl group-hover:animate-pulse">🍄</span>
            </div>
            <h2 className="text-white font-heading text-xl tracking-[1em] uppercase mb-4 opacity-50">Enter</h2>
            <p className="text-pink-500/30 text-[9px] uppercase tracking-widest font-black">Tap to start calming audio</p>
          </button>
        </div>
      )}

      <canvas ref={canvasRef} />
      
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>

      <div className="absolute top-8 left-8 right-8 z-[110] flex justify-between items-start">
        <div className="flex gap-4">
          <button 
            onClick={onRegenerate}
            disabled={isGenerating}
            className={`px-8 py-3 rounded-full glass border border-white/10 text-white/50 font-bold uppercase tracking-[0.3em] text-[9px] transition-all flex items-center gap-3 ${isGenerating ? 'opacity-50' : 'hover:bg-white/10 hover:text-white'}`}
          >
            {isGenerating ? 'Calming...' : '✧ Change Mood'}
          </button>

          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 rounded-full glass border border-white/10 text-white/30 flex items-center justify-center hover:text-white transition-all text-sm"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
        
        <div className="hidden sm:block text-[9px] text-white/10 uppercase tracking-[0.6em] font-black">
          Zen Audio Engine Active
        </div>
      </div>

      <div className="absolute bottom-12 left-0 right-0 z-[110] flex flex-col items-center gap-6">
        <div className="flex gap-4 p-2 glass rounded-full border border-white/5 backdrop-blur-2xl">
          {[6, 12, 18, 24, 32].map(n => (
            <button 
              key={n}
              onClick={() => setSegments(n)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${segments === n ? 'bg-white/60 text-black' : 'text-white/20 hover:text-white/50'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
