import React, { useState, useRef, MouseEvent } from 'react';
import { Upload, X, RotateCcw, AlertTriangle, Target } from 'lucide-react';
import Image from 'next/image';

export interface Point {
  x: number;
  y: number;
  id: string;
}

export interface SegmentData {
  id: string;
  label: string;
  points: Point[];
}

interface PosturalAnalysisToolProps {
  label: string;
  imageUrl?: string;
  onImageChange: (file: File) => void;
  segments: SegmentData[];
  onSegmentsChange: (segments: SegmentData[]) => void;
  availableSegmentDefinitions: { id: string, label: string }[];
  readOnly?: boolean;
}

export function PosturalAnalysisTool({
  label,
  imageUrl,
  onImageChange,
  segments,
  onSegmentsChange,
  availableSegmentDefinitions,
  readOnly = false
}: PosturalAnalysisToolProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // We could store natural size if needed
  };

  const handleCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    if (readOnly || !imageUrl || !containerRef.current || !activeSegmentId) return;
    
    const currentSegmentIndex = segments.findIndex(s => s.id === activeSegmentId);
    if (currentSegmentIndex >= 0) {
      const currentSegment = segments[currentSegmentIndex];
      if (currentSegment.points.length >= 2) return; // already full

      const rect = containerRef.current.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      const newPoint = { x: px, y: py, id: Math.random().toString(36).substr(2, 9) };

      const updatedSegments = [...segments];
      updatedSegments[currentSegmentIndex] = {
        ...currentSegment,
        points: [...currentSegment.points, newPoint]
      };

      // if segment is now full, deactivate it automatically
      if (updatedSegments[currentSegmentIndex].points.length === 2) {
        setActiveSegmentId(null);
      }

      onSegmentsChange(updatedSegments);
    }
  };

  const clearSegment = (id: string) => {
    if (readOnly) return;
    const updatedSegments = segments.map(s => s.id === id ? { ...s, points: [] } : s);
    onSegmentsChange(updatedSegments);
  };

  const toggleSegmentActive = (id: string) => {
    if (readOnly) return;
    
    // Ensure the segment exists in the array
    if (!segments.find(s => s.id === id)) {
      const def = availableSegmentDefinitions.find(d => d.id === id);
      if (def) {
        onSegmentsChange([...segments, { id: def.id, label: def.label, points: [] }]);
      }
    }
    
    setActiveSegmentId(prev => prev === id ? null : id);
  };

  const calculateAngleDeviations = (points: Point[]) => {
    if (points.length !== 2) return null;
    const [p1, p2] = points;
    const dy = p2.y - p1.y;
    const dx = p2.x - p1.x;
    const angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI;
    
    let angleDeflection = 0;
    let angleText = "";
    if (Math.abs(dx) > Math.abs(dy)) {
      angleDeflection = angleDeg;
      if (angleDeflection > 90) angleDeflection -= 180;
      if (angleDeflection < -90) angleDeflection += 180;
      angleText = `${Math.abs(angleDeflection).toFixed(1)}° (Horizontal)`;
    } else {
      angleDeflection = angleDeg > 0 ? angleDeg - 90 : angleDeg + 90;
      angleText = `${Math.abs(angleDeflection).toFixed(1)}° (Vertical)`;
    }

    return { deflection: angleDeflection, text: angleText };
  };

  // Compute colors for segments
  const colors = ['#0ea5e9', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white uppercase tracking-widest">{label}</h4>
      </div>

      <div className="relative aspect-[3/4] w-full bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden group">
        {!imageUrl ? (
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/50 transition-colors">
            <Upload className="w-8 h-8 text-slate-600 mb-3" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upload Imagem</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              disabled={readOnly}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onImageChange(e.target.files[0]);
                }
              }} 
            />
          </label>
        ) : (
          <div 
            ref={containerRef}
            className={`relative w-full h-full ${activeSegmentId && !readOnly ? 'cursor-crosshair' : ''}`}
            onClick={handleCanvasClick}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imageUrl} 
              alt={label}
              onLoad={handleImageLoad}
              className="w-full h-full object-contain pointer-events-none"
            />
            
            <div className="absolute inset-0 pointer-events-none opacity-20" 
               style={{ backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)', backgroundSize: '40px 40px', backgroundPosition: 'center' }} />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-500/30 pointer-events-none" />
            
            {segments.map((segment, sIdx) => {
              const color = colors[sIdx % colors.length];
              return (
                <React.Fragment key={segment.id}>
                  {segment.points.map((p, pIdx) => (
                    <div 
                      key={p.id}
                      className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white pointer-events-none z-20 flex items-center justify-center text-[8px] font-black text-white"
                      style={{ left: `${p.x}%`, top: `${p.y}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
                    />
                  ))}
                  {segment.points.length === 2 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                      <line 
                        x1={`${segment.points[0].x}%`} 
                        y1={`${segment.points[0].y}%`} 
                        x2={`${segment.points[1].x}%`} 
                        y2={`${segment.points[1].y}%`} 
                        stroke={color} 
                        strokeWidth="3" 
                        strokeDasharray="4 4"
                        style={{ filter: `drop-shadow(0 0 5px ${color})` }}
                      />
                    </svg>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {imageUrl && !readOnly && (
        <div className="flex flex-col gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pontos de Avaliação</p>
          {availableSegmentDefinitions.map((def, idx) => {
            const segment = segments.find(s => s.id === def.id);
            const isActive = activeSegmentId === def.id;
            const isFull = segment && segment.points.length === 2;
            const color = colors[segments.findIndex(s => s.id === def.id) !== -1 ? segments.findIndex(s => s.id === def.id) % colors.length : 0];
            const angleData = segment ? calculateAngleDeviations(segment.points) : null;
            
            return (
              <div key={def.id} className={`flex items-center justify-between p-2 rounded-lg border ${isActive ? 'bg-slate-800 border-cyan-500/50' : 'bg-slate-900/80 border-slate-800/50'}`}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSegmentActive(def.id)}
                    className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors ${isActive ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                    disabled={isFull}
                  >
                    <Target className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">{def.label}</span>
                    {segment && segment.points.length > 0 && (
                      <span className="text-[10px] text-slate-400">{segment.points.length}/2 pontos</span>
                    )}
                  </div>
                </div>
                
                {angleData && (
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold ${Math.abs(angleData.deflection) > 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {angleData.text}
                    </span>
                    <button onClick={() => clearSegment(def.id)} className="text-slate-500 hover:text-rose-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {readOnly && segments.length > 0 && (
        <div className="flex flex-col gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
           {segments.map((segment, idx) => {
             const angleData = calculateAngleDeviations(segment.points);
             const color = colors[idx % colors.length];
             if (!angleData) return null;
             return (
               <div key={segment.id} className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                   <span className="text-xs font-bold text-slate-300">{segment.label}</span>
                 </div>
                 <span className={`text-[10px] font-bold ${Math.abs(angleData.deflection) > 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {angleData.text}
                 </span>
               </div>
             )
           })}
        </div>
      )}
    </div>
  );
}
