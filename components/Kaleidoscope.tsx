
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
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const [segments, setSegments] = useState(12);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [localIsGenerating, setLocalIsGenerating] = useState(false);
  
  const imgRef = useRef<HTMLImageElement | null>(null);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  // GUARANTEED AUDIO: Web Audio API Fallback
  const startProceduralAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Deep meditative hum (Sine waves at harmonic frequencies)
      const frequencies = [55, 110, 165]; // A1, A2, E3
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05 / (i + 1), ctx.currentTime + 2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
      });
    } catch (e) {
      console.error("Web Audio API failed", e);
    }
  };

  useEffect(() => {
    setLocalIsGenerating(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      imgRef.current = img;
      setIsReady(true);
      setLocalIsGenerating(false);
    };

    img.onerror = () => {
      console.error("Image load failed, using procedural fallback");
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 512;
      tempCanvas.height = 512;
      const tCtx = tempCanvas.getContext('2d');
      if (tCtx) {
        const grad = tCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
        grad.addColorStop(0, '#ff0080');
        grad.addColorStop(1, '#1a1a1a');
        tCtx.fillStyle = grad;
        tCtx.fillRect(0, 0, 512, 512);
        const fallbackImg = new Image();
        fallbackImg.src = tempCanvas.toDataURL();
        imgRef.current = fallbackImg;
        setIsReady(true);
        setLocalIsGenerating(false);
      }
    };

    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    // Primary Audio Source
    const audio = new Audio('https://ia800905.us.archive.org/19/items/FREE_background_music_zen_meditation/Zen-Meditation.mp3'); 
    audio.loop = true;
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

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
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const handleStart = () => {
    setHasInteracted(true);
    // Try MP3 first
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        console.warn("MP3 blocked, switching to procedural audio hum.");
        startProceduralAudio();
      });
    } else {
      startProceduralAudio();
    }
  };

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
    if (audioCtxRef.current) {
      if (isMuted) audioCtxRef.current.suspend();
      else audioCtxRef.current.resume();
    }
  }, [isMuted]);

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

        const numLayers = 5;
        const zoomSpeed = 0.03;
        const globalZoom = (time * zoomSpeed) % 1;

        for (let l = 0; l < numLayers; l++) {
          const layerProgress = (l - globalZoom) / numLayers;
          const scale = Math.pow(6, (1 - layerProgress) * 2.2);
          const opacity = Math.pow(Math.sin(layerProgress * Math.PI), 2.5);

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.globalAlpha = opacity * 0.7;
          ctx.rotate(time * 0.015 + l * 0.8);
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

            const driftX = Math.sin(time * 0.05) * 60;
            const driftY = (time * 12) % img.height;

            try {
              ctx.drawImage(img, -256 + driftX, -256 + driftY, 512, 512);
            } catch (e) {}
            ctx.restore();
          }
          ctx.restore();
        }
        ctx.restore();

        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.75);
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
        <div className="absolute inset-0 z-[150] bg-black/95 flex flex-col items-center justify-center text-center p-6">
          <button 
            onClick={handleStart}
            className="group flex flex-col items-center"
          >
            <div className="w-28 h-28 rounded-full border border-pink-500/20 flex items-center justify-center mb-10 group-hover:border-pink-500 transition-all duration-1000 group-hover:scale-105 shadow-[0_0_50px_rgba(236,72,153,0.1)]">
              <span className="text-6xl drop-shadow-lg">🍄</span>
            </div>
            <h2 className="text-white font-heading text-2xl tracking-[1em] uppercase mb-4 opacity-80">Sync Spores</h2>
            <p className="text-pink-500/40 text-[10px] uppercase tracking-[0.5em] font-black animate-pulse">Activate Sonic & Visual Field</p>
          </button>
        </div>
      )}

      {(localIsGenerating || isGenerating) && (
        <div className="absolute inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-center justify-center transition-opacity duration-1000">
           <div className="text-[11px] uppercase tracking-[1.5em] text-white/30 animate-pulse">Shifting Consciousness...</div>
        </div>
      )}

      <canvas ref={canvasRef} className="w-full h-full object-cover" />
      
      <div className="absolute top-8 left-8 right-8 z-[110] flex justify-between items-center pointer-events-none">
        <div className="flex gap-4 pointer-events-auto">
          <button 
            onClick={onRegenerate}
            disabled={localIsGenerating || isGenerating}
            className="px-10 py-3 rounded-full glass border border-white/10 text-white/40 font-bold uppercase tracking-[0.4em] text-[10px] hover:text-white hover:border-white/40 transition-all disabled:opacity-10"
          >
            ✧ Evolve
          </button>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-12 h-12 rounded-full glass border border-white/10 text-white/30 flex items-center justify-center hover:text-white transition-all shadow-xl"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
        <button onClick={onClose} className="text-white/10 hover:text-white text-[10px] uppercase tracking-[0.8em] pointer-events-auto font-black transition-colors">Disconnect</button>
      </div>

      <div className="absolute bottom-16 left-0 right-0 z-[110] flex flex-col items-center gap-6">
        <div className="flex gap-4 p-2.5 glass rounded-full border border-white/5 shadow-2xl">
          {[6, 12, 18, 24, 32].map(n => (
            <button 
              key={n}
              onClick={() => setSegments(n)}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${segments === n ? 'bg-white text-black scale-110 shadow-2xl' : 'text-white/10 hover:text-white/40'}`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="text-white/5 text-[8px] uppercase tracking-[2em] font-black ml-[2em]">Neural Density</div>
      </div>
    </div>
  );
};
