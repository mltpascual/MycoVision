
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Kaleidoscope } from './Kaleidoscope';

const mushroomPresets = [
  "Golden Teacher Fractal Mandala, deep crimson and gold",
  "Neon Mycelium Neural Network, electric blue and violet",
  "Infinite Spore Geometry, emerald and copper bioluminescence",
  "Amanita Muscaria Crystalline fractal structure",
  "Bioluminescent Forest Deep Pulse, glowing pink hyphae",
  "Psilocybin molecule geometry, rainbow iridescent light"
];

export const Generator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showKaleidoscope, setShowKaleidoscope] = useState(false);

  const handleGenerate = useCallback(async (customPrompt?: string) => {
    const targetPrompt = customPrompt || prompt || mushroomPresets[Math.floor(Math.random() * mushroomPresets.length)];
    if (!targetPrompt) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `High contrast, vivid, intricate psychedelic mushroom pattern. Style: Mandalas, glowing light, deep neon colors, fractal symmetry, hyper-detailed. Prompt: ${targetPrompt}`,
            },
          ],
        },
      });

      let foundImage = false;
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64Data = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            setGeneratedImage(base64Data);
            setShowKaleidoscope(true);
            foundImage = true;
            break;
          }
        }
      }
      
      if (!foundImage) throw new Error("No image was returned.");
    } catch (err: any) {
      console.error("Generation Error:", err);
      setError("Fungal network connection lost.");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt]);

  // Initial auto-generation on mount
  useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <div className="max-w-6xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
      {showKaleidoscope && generatedImage && (
        <Kaleidoscope 
          imageSrc={generatedImage} 
          onClose={() => setShowKaleidoscope(false)}
          onRegenerate={() => handleGenerate()}
          isGenerating={isGenerating}
        />
      )}

      {/* Loading State for initial tunnel entry */}
      {!showKaleidoscope && (
        <div className="flex flex-col items-center gap-8 text-center animate-in fade-in duration-1000">
          <div className="relative">
            <div className="w-24 h-24 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🍄</div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold tracking-[0.2em] uppercase text-white">Opening the Portal</h2>
            <p className="text-pink-500/60 text-xs uppercase tracking-widest animate-pulse">Synchronizing Neural Spores...</p>
          </div>
          
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
              <button onClick={() => handleGenerate()} className="block mx-auto mt-2 underline">Retry Connection</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
