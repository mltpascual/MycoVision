
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
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Robust audio source with HTTPS and error handling
    const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); 
    audio.loop = true;
    audio.volume = 0.3;
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const img = new Image();
    img.crossOrigin = "anonymous"; // CRITICAL for Vercel/External Canvas use
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      setError(null);
    };
    img.onerror = () => {
      setError("Visual asset failed to load. Please try another.");
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
      cancelAnimationFrame(requestRef.current);
    };
  }, [imageSrc]);

  const handleStart = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.warn("Autoplay blocked or audio failed:", err);
      });
    }
    setHasInteracted(true);
  };

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
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
        const radius = Math.sqrt(width * width + height * height) * 0.8;
        const step = (Math.PI * 2) / segments;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const numLayers = 8;
        const zoomSpeed = 0.025; // Hypnotic slow crawl
        const globalZoom = (time * zoomSpeed) % 1;

        for (let l = 0; l < numLayers; l++) {
          const layerProgress = (l - globalZoom) / numLayers;
          const scale = Math.pow(4, (1 - layerProgress) * 3);
          
          let opacity = Math.sin(layerProgress * Math.PI);
          opacity = Math.pow(Math.max(0, opacity), 2);

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.globalAlpha = opacity * 0.7;
          
          ctx.rotate(time * 0.005 + (l * 0.1));
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

            const textureScale = 0.6 / dpr; 
            const driftX = Math.sin(time * 0.03) * 100;
            const driftY = (time * 20) % img.height;

            try {
              ctx.drawImage(
                img,
                -(img.width * textureScale / 2) + (driftX * textureScale),
                -(img.height * textureScale / 2) + (driftY * textureScale),
                img.width * textureScale,
                img.height * textureScale
              );
            } catch (e) {
              // Silently ignore canvas drawing errors on frame drops
            }
            ctx.restore();
          }
          ctx.restore();
        }

        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.7, 'rgba(0,0,0,0.4)');
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
        <div className="absolute inset-0 z-[150] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-6">
          <button 
            onClick={handleStart}
            className="group flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-full border border-pink-500/30 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:border-pink-500 transition-all duration-700">
              <span className="text-4xl animate-pulse">🍄</span>
            </div>
            <h2 className="text-white font-heading text-lg tracking-[0.8em] uppercase mb-2 opacity-60">Begin Journey</h2>
            <p className="text-pink-500/40 text-[8px] uppercase tracking-widest font-black">Click to sync visuals and audio</p>
          </button>
        </div>
      )}

      {error && (
        <div className="absolute top-20 z-[160] px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-full text-[10px] uppercase tracking-widest text-red-200">
          {error}
        </div>
      )}

      <canvas ref={canvasRef} className="block w-full h-full" />
      
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-black/80"></div>

      <div className="absolute top-8 left-8 right-8 z-[110] flex justify-between items-start">
        <div className="flex gap-4">
          <button 
            onClick={onRegenerate}
            disabled={isGenerating}
            className={`px-6 py-2 rounded-full glass border border-white/10 text-white/50 font-bold uppercase tracking-[0.2em] text-[9px] transition-all flex items-center gap-2 ${isGenerating ? 'opacity-50' : 'hover:bg-white/10 hover:text-white'}`}
          >
            {isGenerating ? '...' : '✧ Change Perspective'}
          </button>

          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-9 h-9 rounded-full glass border border-white/10 text-white/30 flex items-center justify-center hover:text-white transition-all text-xs"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
        
        <div className="hidden sm:block text-[8px] text-white/10 uppercase tracking-[0.6em] font-black mt-3">
          Neural Engine Stable
        </div>
      </div>

      <div className="absolute bottom-12 left-0 right-0 z-[110] flex flex-col items-center gap-4">
        <div className="flex gap-3 p-1.5 glass rounded-full border border-white/5 backdrop-blur-3xl">
          {[6, 12, 18, 24, 32].map(n => (
            <button 
              key={n}
              onClick={() => setSegments(n)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${segments === n ? 'bg-white/70 text-black' : 'text-white/20 hover:text-white/50'}`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-white/10 text-[7px] uppercase tracking-[1em] font-black">Geometric Complexity</p>
      </div>
    </div>
  );
};
