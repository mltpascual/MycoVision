
import React from 'react';
import { Generator } from './components/Generator';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-pink-500 selection:text-white">
      {/* Header for the Single Page app */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold">🍄</span>
            </div>
            <span className="text-xl font-bold tracking-tighter font-heading bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              MYCOVISION
            </span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold hidden sm:block">
            Neural Tunnel Engine v2.5
          </div>
        </div>
      </header>
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Generator />
        </div>
      </main>

      <footer className="py-8 border-t border-white/5 text-center">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-medium">
          &copy; 2024 MYCOVISION LABS. POWERED BY GEMINI AI.
        </p>
      </footer>
    </div>
  );
};

export default App;
