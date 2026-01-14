
import React, { useState, useEffect, useCallback } from 'react';
import { Kaleidoscope } from './Kaleidoscope';

const PREMADE_PATTERNS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1502691876148-a84978e59af8?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1600"
];

export const Generator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>(PREMADE_PATTERNS[0]);
  const [showKaleidoscope, setShowKaleidoscope] = useState(false);

  const handleEvolve = useCallback(() => {
    setIsGenerating(true);
    
    // Pick a new image that isn't the current one
    const available = PREMADE_PATTERNS.filter(p => p !== currentImage);
    const nextImage = available[Math.floor(Math.random() * available.length)];
    
    // Smooth transition
    setTimeout(() => {
      setCurrentImage(nextImage);
      setIsGenerating(false);
      setShowKaleidoscope(true);
    }, 200);
  }, [currentImage]);

  return (
    <div className="max-w-6xl mx-auto min-h-[70vh] flex flex-col items-center justify-center">
      {showKaleidoscope ? (
        <Kaleidoscope 
          imageSrc={currentImage} 
          onClose={() => setShowKaleidoscope(false)}
          onRegenerate={handleEvolve}
          isGenerating={isGenerating}
        />
      ) : (
        <div className="flex flex-col items-center gap-12 text-center">
          <button 
            onClick={handleEvolve}
            className="group relative flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-3xl group-hover:bg-pink-500/40 transition-all duration-700"></div>
            <div className="w-40 h-40 border border-white/10 rounded-full flex items-center justify-center relative overflow-hidden bg-white/5 backdrop-blur-xl group-hover:scale-110 group-hover:border-white/30 transition-all duration-700">
                <span className="text-6xl animate-bounce">🍄</span>
            </div>
          </button>
          
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-4xl font-heading font-bold tracking-[0.2em] uppercase text-white drop-shadow-2xl">Initialize Spores</h2>
            <p className="text-gray-400 text-xs tracking-widest leading-relaxed uppercase opacity-60">
              Enter the collective neural network of the fungal realm.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
