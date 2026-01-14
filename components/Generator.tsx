
import React, { useState, useEffect, useCallback } from 'react';
import { Kaleidoscope } from './Kaleidoscope';

// Curated library specifically matching the 'Ethereal Soul' and 'Vibrant Fractal' references
const PREMADE_PATTERNS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600", // Neural Glow
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1600", // Vibrant Neon Flow
  "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=1600", // Fractal Patterns
  "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=80&w=1600", // Abstract Chaos
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=1600", // Liquid Colors
  "https://images.unsplash.com/photo-1502691876148-a84978e59af8?auto=format&fit=crop&q=80&w=1600", // Prismatic Perspective
  "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&q=80&w=1600", // Deep Neural
  "https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=80&w=1600", // Cosmic 3D
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1600", // Ethereal Gradient
  "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1600"  // Prism Waves
];

export const Generator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [showKaleidoscope, setShowKaleidoscope] = useState(false);

  const handleEvolve = useCallback(() => {
    setIsGenerating(true);
    
    // Slight delay to simulate 'synthesis'
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * PREMADE_PATTERNS.length);
      const nextImage = PREMADE_PATTERNS[randomIndex];
      
      setCurrentImage(nextImage);
      setShowKaleidoscope(true);
      setIsGenerating(false);
    }, 400);
  }, []);

  useEffect(() => {
    handleEvolve();
  }, [handleEvolve]);

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
            <h2 className="text-2xl font-heading font-bold tracking-[0.3em] uppercase text-white">Opening Portal</h2>
            <p className="text-pink-500/60 text-[10px] uppercase tracking-[0.5em] animate-pulse">Synchronizing Neural Spores...</p>
          </div>
        </div>
      )}
    </div>
  );
};
