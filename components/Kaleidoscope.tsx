
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
  const [isReady, setIsReady] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Audio setup
    const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); 
    audio.loop = true;
    audio.volume = 0.2;
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const img = new Image();
    // THE ORDER MATTERS: crossOrigin MUST be set before src
    img.crossOrigin = "anonymous"; 
    
    img.onload = () => {
      imgRef.current = img;
      setIsReady(true);
    };

    img.onerror = () => {
      console.error("Image failed to load, using color fallback");
      // Create a small colorful placeholder if the image fails
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 100;
      tempCanvas.height = 100;
      const tCtx = tempCanvas.getContext('2d');
      if (tCtx) {
        const grad = tCtx.createLinearGradient(0,0,100,100);
        grad.addColorStop(0, '#ff00ff');
        grad.addColorStop(1, '#00ffff');
        tCtx.fillStyle = grad;
        tCtx.fillRect(0,0,100,100);
        const fallbackImg = new Image();
        fallbackImg.src = tempCanvas.toDataURL();
        imgRef.current = fallbackImg;
        setIsReady(true);
      }
    };

    img.src = imageSrc;

    const handleResize = () => {
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = window.innerWidth * dpr;
        canvasRef.current.height = window.innerHeight * dpr;
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
      audioRef.current.play().catch(() => {
        console.log("Audio play blocked by browser policy");
      });
    }
    setHasInteracted(true);
  };

  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const img = imgRef.current;

      if (canvas && ctx && img && isReady) {
        const dpr = window.devicePixelRatio || 1;
        const time = (Date.now() - startTimeRef.current) * 0.001;
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.max(width, height);
        const step = (Math.PI * 2) / segments;

        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        const numLayers = 6;
        const zoomSpeed = 0.02;
        const globalZoom = (time * zoomSpeed) % 1;

        for (let l = 0; l < numLayers; l++) {
          const layerProgress = (l - globalZoom) / numLayers;
          const scale = Math.pow(5, (1 - layerProgress) * 2.5);
          const opacity = Math.pow(Math.sin(layerProgress * Math.PI), 2);

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.globalAlpha = opacity * 0.6;
          ctx.rotate(time * 0.01 + l);
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

            const driftX = Math.sin(time * 0.05) * 50;
            const driftY = (time * 10) % img.height;

            try {
              // Using drawImage with explicit dimensions to avoid aspect ratio crashes
              ctx.drawImage(img, -250 + driftX, -250 + driftY, 500, 500);
            } catch (e) {
              // Frame dropped
            }
            ctx.restore();
          }
          ctx.restore();
        }
        ctx.restore();

        // Vignette
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.7);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, 'black');
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,width,height);
      }
      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current);
  }, [segments, isReady]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
      {!hasInteracted && (
        <div className="absolute inset-0 z-[150] bg-black flex flex-col items-center justify-center text-center p-6">
          <button 
            onClick={handleStart}
            className="group flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full border border-pink-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <span className="text-4xl">🍄</span>
            </div>
            <h2 className="text-white font-heading text-lg tracking-[0.5em] uppercase mb-2">Initialize</h2>
            <p className="text-pink-500/40 text-[8px] uppercase tracking-widest">Tap to sync audio and light</p>
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="w-full h-full object-cover" />
      
      <div className="absolute top-8 left-8 right-8 z-[110] flex justify-between items-center pointer-events-none">
        <div className="flex gap-4 pointer-events-auto">
          <button 
            onClick={onRegenerate}
            className="px-6 py-2 rounded-full glass border border-white/10 text-white/50 font-bold uppercase tracking-widest text-[9px] hover:text-white transition-all"
          >
            {isGenerating ? 'Evolving...' : '✧ Evolve'}
          </button>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-9 h-9 rounded-full glass border border-white/10 text-white/30 flex items-center justify-center hover:text-white"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
        <button onClick={onClose} className="text-white/20 hover:text-white text-[9px] uppercase tracking-widest pointer-events-auto">Close</button>
      </div>

      <div className="absolute bottom-12 left-0 right-0 z-[110] flex flex-col items-center gap-4">
        <div className="flex gap-2 p-1.5 glass rounded-full border border-white/5">
          {[8, 12, 16, 24, 32].map(n => (
            <button 
              key={n}
              onClick={() => setSegments(n)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${segments === n ? 'bg-white/80 text-black' : 'text-white/20 hover:text-white/40'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
