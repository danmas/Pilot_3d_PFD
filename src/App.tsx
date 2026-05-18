/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Upload, FileJson, Play, Pause, Activity, Database } from 'lucide-react';
import { PFDFrame } from './types';
import { sampleFrames } from './sample-data';
import { PFD } from './components/PFD/PFD';

export default function App() {
  const [frame, setFrame] = useState<PFDFrame>(sampleFrames[0]);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'pfd' | 'data'>('pfd');
  
  const frameRef = useRef(frameIndex);

  useEffect(() => {
    let animationId: number;
    let lastTime = 0;

    const tick = (time: number) => {
      if (!lastTime) lastTime = time;
      const dt = time - lastTime;
      
      // Update at roughly 30fps
      if (dt > 33) {
        frameRef.current = (frameRef.current + 1) % sampleFrames.length;
        setFrameIndex(frameRef.current);
        setFrame(sampleFrames[frameRef.current]);
        lastTime = time;
      }
      
      if (isPlaying) {
        animationId = requestAnimationFrame(tick);
      }
    };

    if (isPlaying) {
      animationId = requestAnimationFrame(tick);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        if (json.schema === 'pfd-frame.v1') {
          setFrame(json);
          setIsPlaying(false); // Stop animation when file uploaded
          setError(null);
        } else {
          setError('Invalid schema version. Expected pfd-frame.v1');
        }
      } catch (err) {
        setError('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
        <header className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white font-medium text-lg tracking-tight">Primary Flight Display</h1>
              <p className="text-white/50 text-sm">pfd-frame.v1 viewer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button 
                onClick={() => setActiveTab('pfd')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${activeTab === 'pfd' ? 'bg-blue-500/20 text-blue-400' : 'text-white/60 hover:text-white'}`}
              >
                <Activity className="w-4 h-4" /> Display
              </button>
              <button 
                onClick={() => setActiveTab('data')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${activeTab === 'data' ? 'bg-blue-500/20 text-blue-400' : 'text-white/60 hover:text-white'}`}
              >
                <Database className="w-4 h-4" /> Data
              </button>
            </div>

            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 transition text-white text-sm font-medium rounded-lg border border-white/10"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {error && <span className="text-red-400 text-sm font-medium">{error}</span>}
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 transition text-white text-sm font-medium rounded-lg border border-white/10">
              <Upload className="w-4 h-4" />
              Upload JSON
              <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </header>

        <main className="w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-2xl relative border-4 border-gray-900 select-none flex">
          {activeTab === 'pfd' ? (
            <PFD frame={frame} />
          ) : (
            <div className="w-full h-full p-6 overflow-auto text-sm font-mono text-green-400 bg-black/90">
              <pre>{JSON.stringify(frame, null, 2)}</pre>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
