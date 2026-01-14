
import React, { useState, useEffect, useCallback } from 'react';
import { Kaleidoscope } from './Kaleidoscope';

// Curated library matching the user's uploaded aesthetic (Character silhouettes + Deep Fractals)
const PREMADE_PATTERNS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=95&w=1600", // Neural Flow
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=95&w=1600", // Neon Prism
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=95&w=1600", // Liquid Fractal
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=95&w=1600", // Rainbow Crystal
  "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=95&w=1600", // Deep Color Bleed
  "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=95&w=1600", // Prismatic Waves
  "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=95&w=1600", // Organic Texture
  "https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=95&w=1600", // Hyper-detailed 3D
  "https://images.unsplash.com/photo-1500462859273-500497d73e17?auto=format&fit=crop&q=95&w=1600", // Chromatic Shift
  "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=95&w=1600"  // Cosmic Deep Purple
];

export const Generator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [showKaleidoscope, setShowKaleidoscope] = useState(false);

  const handleEvolve = useCallback(() => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * PREMADE_PATTERNS.length);
      const nextImage = PREMADE_PATTERNS[randomIndex];
      
      if (nextImage === currentImage) {
        setCurrentImage(PREMADE_PATTERNS[(randomIndex + 1) % PREMADE_PATTERNS.length]);
      } else {
        setCurrentImage(nextImage);
      }
      
      setShowKaleidoscope(true);
      setIsGenerating(false);
    }, 500);
  }, [currentImage]);

  useEffect(() => {
    handleEvolve();
  }, []);

  return (
    <div className="max-w-6xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
      {showKaleidoscope && currentImage && (
        <Kaleidoscope 
          imageSrc={currentImage} 
          onClose={() => setShowKaleidoscope(false)}
          onRegenerate={handleEvolve}
          isGenerating={isGenerating}
        />
      )}

      {!showKaleidoscope && (
        <div className="flex flex-col items-center gap-8 text-center animate-in fade-in duration-1000">
          <div className="relative">
            <div className="w-24 h-24 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">🍄</div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold tracking-[0.3em] uppercase text-white">Harmonizing Mycelium</h2>
            <p className="text-pink-500/60 text-[10px] uppercase tracking-[0.5em] animate-pulse">Preparing Calming Visuals...</p>
          </div>
        </div>
      )}
    </div>
  );
};
