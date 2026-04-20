"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

type BodyPart = {
  id: string;
  label: string;
  front?: boolean;
  back?: boolean;
  shape: "ellipse" | "path" | "circle" | "rect";
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  r?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  d?: string;
  transform?: string;
};

export const bodyParts: BodyPart[] = [
  // Front
  {
    id: "head_f",
    label: "Cabeça",
    front: true,
    shape: "path",
    d: "M88,20 C88,5 112,5 112,20 C112,35 108,45 100,50 C92,45 88,35 88,20 Z",
  },
  {
    id: "neck_f",
    label: "Pescoço",
    front: true,
    shape: "path",
    d: "M94,45 L106,45 L110,55 L90,55 Z",
  },
  {
    id: "chest",
    label: "Peitoral",
    front: true,
    shape: "path",
    d: "M75,55 C85,55 95,65 100,65 C105,65 115,55 125,55 C130,70 125,85 100,85 C75,85 70,70 75,55 Z",
  },
  {
    id: "abs",
    label: "Abdômen",
    front: true,
    shape: "path",
    d: "M82,85 C90,85 95,85 100,85 C105,85 110,85 118,85 C115,115 112,135 100,140 C88,135 85,115 82,85 Z",
  },
  {
    id: "shoulder_l_f",
    label: "Deltoide Esq.",
    front: true,
    shape: "path",
    d: "M75,55 C65,55 55,65 52,80 C50,90 60,95 65,85 C70,75 75,65 75,55 Z",
  },
  {
    id: "shoulder_r_f",
    label: "Deltoide Dir.",
    front: true,
    shape: "path",
    d: "M125,55 C135,55 145,65 148,80 C150,90 140,95 135,85 C130,75 125,65 125,55 Z",
  },
  {
    id: "biceps_l_f",
    label: "Bíceps Esq.",
    front: true,
    shape: "path",
    d: "M52,80 C45,95 45,110 48,120 C55,120 62,105 65,85 C60,90 55,85 52,80 Z",
  },
  {
    id: "biceps_r_f",
    label: "Bíceps Dir.",
    front: true,
    shape: "path",
    d: "M148,80 C155,95 155,110 152,120 C145,120 138,105 135,85 C140,90 145,85 148,80 Z",
  },
  {
    id: "forearm_l_f",
    label: "Antebraço Esq.",
    front: true,
    shape: "path",
    d: "M48,120 C40,140 35,150 38,165 C45,160 52,140 55,120 C50,120 48,120 48,120 Z",
  },
  {
    id: "forearm_r_f",
    label: "Antebraço Dir.",
    front: true,
    shape: "path",
    d: "M152,120 C160,140 165,150 162,165 C155,160 148,140 145,120 C150,120 152,120 152,120 Z",
  },
  {
    id: "hand_l_f",
    label: "Mão Esq.",
    front: true,
    shape: "path",
    d: "M38,165 C30,180 32,190 40,190 C45,190 48,180 45,165 Z",
  },
  {
    id: "hand_r_f",
    label: "Mão Dir.",
    front: true,
    shape: "path",
    d: "M162,165 C170,180 168,190 160,190 C155,190 152,180 155,165 Z",
  },
  {
    id: "pelvis_f",
    label: "Oblíquos/Pelve",
    front: true,
    shape: "path",
    d: "M82,130 C75,130 75,150 85,160 L100,165 L115,160 C125,150 125,130 118,130 C115,140 105,145 100,145 C95,145 85,140 82,130 Z",
  },
  {
    id: "thigh_l_f",
    label: "Quadríceps Esq.",
    front: true,
    shape: "path",
    d: "M85,160 C70,160 65,220 72,250 C80,250 92,220 98,165 C92,165 88,162 85,160 Z",
  },
  {
    id: "thigh_r_f",
    label: "Quadríceps Dir.",
    front: true,
    shape: "path",
    d: "M115,160 C130,160 135,220 128,250 C120,250 108,220 102,165 C108,165 112,162 115,160 Z",
  },
  {
    id: "knee_l_f",
    label: "Joelho Esq.",
    front: true,
    shape: "circle",
    cx: 80,
    cy: 260,
    r: 8,
  },
  {
    id: "knee_r_f",
    label: "Joelho Dir.",
    front: true,
    shape: "circle",
    cx: 120,
    cy: 260,
    r: 8,
  },
  {
    id: "calf_l_f",
    label: "Tibial Esq.",
    front: true,
    shape: "path",
    d: "M72,270 C65,290 68,320 75,340 C82,320 88,290 85,270 C80,275 75,275 72,270 Z",
  },
  {
    id: "calf_r_f",
    label: "Tibial Dir.",
    front: true,
    shape: "path",
    d: "M128,270 C135,290 132,320 125,340 C118,320 112,290 115,270 C120,275 125,275 128,270 Z",
  },
  {
    id: "foot_l_f",
    label: "Pé Esq.",
    front: true,
    shape: "path",
    d: "M75,340 C70,350 65,360 70,365 C80,365 85,350 82,340 Z",
  },
  {
    id: "foot_r_f",
    label: "Pé Dir.",
    front: true,
    shape: "path",
    d: "M125,340 C130,350 135,360 130,365 C120,365 115,350 118,340 Z",
  },

  // Back
  {
    id: "head_b",
    label: "Cabeça",
    back: true,
    shape: "path",
    d: "M88,20 C88,5 112,5 112,20 C112,35 108,45 100,50 C92,45 88,35 88,20 Z",
  },
  {
    id: "neck_b",
    label: "Pescoço",
    back: true,
    shape: "path",
    d: "M94,45 L106,45 L112,60 L88,60 Z",
  },
  {
    id: "upper_back",
    label: "Trapézio",
    back: true,
    shape: "path",
    d: "M88,60 L112,60 L125,75 L100,105 L75,75 Z",
  },
  {
    id: "lats",
    label: "Dorsais",
    back: true,
    shape: "path",
    d: "M75,75 L100,105 L125,75 C130,90 115,120 100,130 C85,120 70,90 75,75 Z",
  },
  {
    id: "lower_back",
    label: "Lombar",
    back: true,
    shape: "path",
    d: "M85,120 L115,120 L110,145 L90,145 Z",
  },
  {
    id: "shoulder_l_b",
    label: "Deltoide Post. Esq.",
    back: true,
    shape: "path",
    d: "M75,60 C65,60 55,70 52,85 C60,90 68,85 75,75 Z",
  },
  {
    id: "shoulder_r_b",
    label: "Deltoide Post. Dir.",
    back: true,
    shape: "path",
    d: "M125,60 C135,60 145,70 148,85 C140,90 132,85 125,75 Z",
  },
  {
    id: "triceps_l_b",
    label: "Tríceps Esq.",
    back: true,
    shape: "path",
    d: "M52,85 C45,100 45,115 48,125 C55,125 62,110 65,90 C60,95 55,90 52,85 Z",
  },
  {
    id: "triceps_r_b",
    label: "Tríceps Dir.",
    back: true,
    shape: "path",
    d: "M148,85 C155,100 155,115 152,125 C145,125 138,110 135,90 C140,95 145,90 148,85 Z",
  },
  {
    id: "forearm_l_b",
    label: "Antebraço Esq.",
    back: true,
    shape: "path",
    d: "M48,125 C40,145 35,155 38,170 C45,165 52,145 55,125 C50,125 48,125 48,125 Z",
  },
  {
    id: "forearm_r_b",
    label: "Antebraço Dir.",
    back: true,
    shape: "path",
    d: "M152,125 C160,145 165,155 162,170 C155,165 148,145 145,125 C150,125 152,125 152,125 Z",
  },
  {
    id: "hand_l_b",
    label: "Mão Esq.",
    back: true,
    shape: "path",
    d: "M38,170 C30,185 32,195 40,195 C45,195 48,185 45,170 Z",
  },
  {
    id: "hand_r_b",
    label: "Mão Dir.",
    back: true,
    shape: "path",
    d: "M162,170 C170,185 168,195 160,195 C155,195 152,185 155,170 Z",
  },
  {
    id: "glutes",
    label: "Glúteos",
    back: true,
    shape: "path",
    d: "M85,145 L115,145 C125,155 125,175 115,185 L100,180 L85,185 C75,175 75,155 85,145 Z",
  },
  {
    id: "hamstring_l_b",
    label: "Posterior Esq.",
    back: true,
    shape: "path",
    d: "M85,185 C70,185 68,230 72,260 C80,260 90,230 95,185 C90,185 88,185 85,185 Z",
  },
  {
    id: "hamstring_r_b",
    label: "Posterior Dir.",
    back: true,
    shape: "path",
    d: "M115,185 C130,185 132,230 128,260 C120,260 110,230 105,185 C110,185 112,185 115,185 Z",
  },
  {
    id: "calf_l_b",
    label: "Panturrilha Esq.",
    back: true,
    shape: "path",
    d: "M72,260 C65,280 68,320 75,340 C82,320 88,280 85,260 C80,265 75,265 72,260 Z",
  },
  {
    id: "calf_r_b",
    label: "Panturrilha Dir.",
    back: true,
    shape: "path",
    d: "M128,260 C135,280 132,320 125,340 C118,320 112,280 115,260 C120,265 125,265 128,260 Z",
  },
  {
    id: "foot_l_b",
    label: "Calcanhar Esq.",
    back: true,
    shape: "path",
    d: "M75,340 C70,350 65,360 70,365 C80,365 85,350 82,340 Z",
  },
  {
    id: "foot_r_b",
    label: "Calcanhar Dir.",
    back: true,
    shape: "path",
    d: "M125,340 C130,350 135,360 130,365 C120,365 115,350 118,340 Z",
  },
];

export function PainMap({
  value,
  onChange,
  onPartClick,
  selectedPartId,
  readOnly = false,
  lang = "pt",
}: {
  value: Record<string, { level: number; type: string; phase?: string }>;
  onChange?: (v: Record<string, { level: number; type: string; phase?: string }>) => void;
  onPartClick?: (part: BodyPart) => void;
  selectedPartId?: string;
  readOnly?: boolean;
  lang?: "pt" | "en";
}) {
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const [tempLevel, setTempLevel] = useState<number | null>(null);
  const [tempType, setTempType] = useState<string[]>(["muscle"]);

  const handlePartClick = (part: BodyPart) => {
    if (onPartClick) {
      onPartClick(part);
      return;
    }
    if (readOnly) return;
    setSelectedPart(part);
    if (value[part.id]) {
      setTempLevel(value[part.id].level);
      const existingType = value[part.id].type;
      setTempType(existingType ? existingType.split(', ') : ["muscle"]);
    } else {
      setTempLevel(null);
      setTempType(["muscle"]);
    }
  };

  const handleSave = () => {
    if (selectedPart && onChange && tempLevel !== null) {
      onChange({
        ...value,
        [selectedPart.id]: { 
          ...value[selectedPart.id],
          level: tempLevel, 
          type: tempType.join(', ') 
        },
      });
      setSelectedPart(null);
    }
  };

  const toggleType = (id: string) => {
    setTempType(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleRemove = () => {
    if (selectedPart && onChange) {
      const newValue = { ...value };
      delete newValue[selectedPart.id];
      onChange(newValue);
      setSelectedPart(null);
    }
  };

  const handleClearAll = () => {
    if (onChange && !readOnly) {
      onChange({});
    }
  };

  const getStyleProps = (id: string, isHovered: boolean) => {
    const data = value[id];
    const score = data?.level;
    const phase = data?.phase;
    const isExternallySelected = selectedPartId === id;

    // Default Hologram State
    if (score === undefined && !phase) {
      return {
        fill: (isHovered || isExternallySelected) ? "rgba(6, 182, 212, 0.3)" : "rgba(6, 182, 212, 0.05)",
        stroke: (isHovered || isExternallySelected) ? "rgba(34, 211, 238, 1)" : "rgba(6, 182, 212, 0.5)",
        filter: (isHovered || isExternallySelected) ? "url(#glow-cyan)" : "none",
        strokeWidth: (isHovered || isExternallySelected) ? "2" : "1",
      };
    }

    // Phase-based coloring (Rehab Progression)
    if (phase) {
      const phaseStyles: Record<string, any> = {
        "Aguda": { fill: "rgba(244, 63, 94, 0.6)", stroke: "#fda4af", glow: "url(#glow-red)" },
        "Subaguda": { fill: "rgba(245, 158, 11, 0.6)", stroke: "#fcd34d", glow: "url(#glow-orange)" },
        "Funcional": { fill: "rgba(6, 182, 212, 0.6)", stroke: "#67e8f9", glow: "url(#glow-cyan)" },
        "Retorno ao Esporte": { fill: "rgba(16, 185, 129, 0.6)", stroke: "#6ee7b7", glow: "url(#glow-green)" },
      };
      
      const style = phaseStyles[phase] || phaseStyles["Aguda"];
      return {
        fill: style.fill,
        stroke: (isHovered || isExternallySelected) ? "#ffffff" : style.stroke,
        filter: style.glow,
        strokeWidth: (isHovered || isExternallySelected) ? "3" : "2",
      };
    }

    // Pain States (Fallback)
    const baseStyle = {
      strokeWidth: (isHovered || isExternallySelected) ? "3" : "2",
      filter: score <= 3 ? "url(#glow-yellow)" : score <= 6 ? "url(#glow-orange)" : "url(#glow-red)",
    };

    if (score <= 3)
      return {
        ...baseStyle,
        fill: "rgba(253, 224, 71, 0.6)", // Yellow
        stroke: (isHovered || isExternallySelected) ? "#ffffff" : "#fef08a",
      };
    if (score <= 6)
      return {
        ...baseStyle,
        fill: "rgba(249, 115, 22, 0.6)", // Orange
        stroke: (isHovered || isExternallySelected) ? "#ffffff" : "#fdba74",
      };
    return {
      ...baseStyle,
      fill: "rgba(239, 68, 68, 0.6)", // Red
      stroke: (isHovered || isExternallySelected) ? "#ffffff" : "#fca5a5",
    };
  };

  const renderBody = (isFront: boolean) => {
    const parts = bodyParts.filter((p) => (isFront ? p.front : p.back));
    return (
      <div className={`relative w-full ${readOnly ? 'max-w-[180px] sm:max-w-[220px]' : 'max-w-[240px] md:max-w-[300px]'} mx-auto aspect-[1/2.2] bg-slate-950 rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] group`}>
        {/* Sci-Fi Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />

        {/* Central Axis Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-cyan-500/20 -translate-x-1/2" />

        {/* Scanning Laser Animation */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_15px_4px_rgba(34,211,238,0.5)] z-20"
          animate={{ top: ["-10%", "110%", "-10%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        <svg
          viewBox="0 0 200 400"
          className="relative z-10 w-full h-full drop-shadow-2xl p-2 sm:p-4"
        >
          <defs>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter
              id="glow-yellow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter
              id="glow-orange"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {parts.map((part) => {
            const isSelected = selectedPart?.id === part.id || selectedPartId === part.id;
            const style = getStyleProps(part.id, isSelected);

            const commonProps = {
              ...style,
              className: `transition-all duration-300 ${(!readOnly || onPartClick) ? "cursor-crosshair hover:brightness-125" : ""}`,
              onClick: () => handlePartClick(part),
              transform: part.transform,
              onMouseEnter: (e: React.MouseEvent<SVGElement>) => {
                if ((!readOnly || onPartClick) && value[part.id] === undefined) {
                  e.currentTarget.style.fill = "rgba(6, 182, 212, 0.3)";
                  e.currentTarget.style.stroke = "rgba(34, 211, 238, 1)";
                  e.currentTarget.style.filter = "url(#glow-cyan)";
                }
              },
              onMouseLeave: (e: React.MouseEvent<SVGElement>) => {
                if ((!readOnly || onPartClick) && value[part.id] === undefined && !isSelected) {
                  e.currentTarget.style.fill = "rgba(6, 182, 212, 0.05)";
                  e.currentTarget.style.stroke = "rgba(6, 182, 212, 0.5)";
                  e.currentTarget.style.filter = "none";
                }
              },
            };

            if (part.shape === "ellipse") {
              return (
                <ellipse
                  key={part.id}
                  cx={part.cx}
                  cy={part.cy}
                  rx={part.rx}
                  ry={part.ry}
                  {...commonProps}
                />
              );
            }
            if (part.shape === "circle") {
              return (
                <circle
                  key={part.id}
                  cx={part.cx}
                  cy={part.cy}
                  r={part.r}
                  {...commonProps}
                />
              );
            }
            if (part.shape === "path") {
              return (
                <path
                  key={part.id}
                  d={part.d}
                  {...commonProps}
                  strokeLinejoin="round"
                />
              );
            }
            if (part.shape === "rect") {
              return (
                <rect
                  key={part.id}
                  x={part.x}
                  y={part.y}
                  width={part.w}
                  height={part.h}
                  rx={part.rx}
                  {...commonProps}
                />
              );
            }
            return null;
          })}

          {/* Biometric Joint Markers */}
          {isFront &&
            [
              { cx: 75, cy: 55 },
              { cx: 125, cy: 55 }, // Shoulders
              { cx: 48, cy: 120 },
              { cx: 152, cy: 120 }, // Elbows
              { cx: 82, cy: 130 },
              { cx: 118, cy: 130 }, // Hips
              { cx: 80, cy: 260 },
              { cx: 120, cy: 260 }, // Knees
              { cx: 75, cy: 340 },
              { cx: 125, cy: 340 }, // Ankles
            ].map((joint, i) => (
              <circle
                key={`joint-${i}`}
                cx={joint.cx}
                cy={joint.cy}
                r="2"
                fill="#22d3ee"
                filter="url(#glow-cyan)"
                className="opacity-50 pointer-events-none"
              />
            ))}
          {!isFront &&
            [
              { cx: 75, cy: 60 },
              { cx: 125, cy: 60 }, // Shoulders
              { cx: 48, cy: 125 },
              { cx: 152, cy: 125 }, // Elbows
              { cx: 85, cy: 145 },
              { cx: 115, cy: 145 }, // Hips
              { cx: 72, cy: 260 },
              { cx: 128, cy: 260 }, // Knees
              { cx: 75, cy: 340 },
              { cx: 125, cy: 340 }, // Ankles
            ].map((joint, i) => (
              <circle
                key={`joint-b-${i}`}
                cx={joint.cx}
                cy={joint.cy}
                r="2"
                fill="#22d3ee"
                filter="url(#glow-cyan)"
                className="opacity-50 pointer-events-none"
              />
            ))}
        </svg>

        {/* Corner HUD Elements */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50" />
      </div>
    );
  };

  return (
    <div className="relative w-full">
      <div className="flex flex-col lg:flex-row justify-center gap-8 items-center">
        <div className="text-center w-full">
          <div className="inline-flex items-center justify-center space-x-2 mb-4 bg-slate-900 px-4 py-1.5 rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Scanner Frontal
            </h4>
          </div>
          {renderBody(true)}
        </div>
        <div className="text-center w-full">
          <div className="inline-flex items-center justify-center space-x-2 mb-4 bg-slate-900 px-4 py-1.5 rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Scanner Dorsal
            </h4>
          </div>
          {renderBody(false)}
        </div>
      </div>

      {!readOnly && Object.keys(value).length > 0 && (
        <div className="flex justify-center mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-[10px] font-black uppercase tracking-widest"
          >
            <X className="w-3 h-3 mr-1" /> Limpar Todo o Mapa
          </Button>
        </div>
      )}

      <AnimatePresence>
        {selectedPart && !readOnly && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] w-full max-w-md overflow-hidden relative"
            >
              {/* Modal HUD Effects */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

              <div className="flex justify-between items-center p-5 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <h3 className="font-bold text-lg text-white tracking-wide uppercase">
                    Análise: {selectedPart.label}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPart(null)}
                  className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <p className="text-cyan-100/70 text-center text-sm uppercase tracking-wider font-medium mb-4">
                    {lang === "pt"
                      ? "Nível de Dor Detectado (0-10)"
                      : "Pain Level Detected (0-10)"}
                  </p>
                  <div className="grid grid-cols-5 sm:grid-cols-11 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                      const isSelected = tempLevel === score;
                      let colorClass =
                        "bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700";
                      if (isSelected) {
                        if (score <= 3)
                          colorClass =
                            "bg-yellow-500/20 text-yellow-400 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]";
                        else if (score <= 6)
                          colorClass =
                            "bg-orange-500/20 text-orange-400 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]";
                        else
                          colorClass =
                            "bg-red-500/20 text-red-400 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]";
                      }

                      return (
                        <button
                          key={score}
                          onClick={() => setTempLevel(score)}
                          className={`h-12 w-full rounded-lg font-bold text-sm transition-all border ${colorClass}`}
                        >
                          {score}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-3 px-1">
                    <span>0 - {lang === "pt" ? "Normal" : "Normal"}</span>
                    <span>10 - {lang === "pt" ? "Crítico" : "Critical"}</span>
                  </div>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <p className="text-cyan-100/70 text-center text-sm uppercase tracking-wider font-medium mb-4">
                    {lang === "pt" ? "Tipo de Dor" : "Pain Type"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        id: "muscle",
                        label: lang === "pt" ? "Cansaço / Peso" : "Tiredness / Heaviness",
                      },
                      {
                        id: "sharp",
                        label: lang === "pt" ? "Pontada / Fisgada" : "Sharp / Pinch",
                      },
                      {
                        id: "throbbing",
                        label: lang === "pt" ? "Latejando" : "Throbbing",
                      },
                      {
                        id: "burning",
                        label: lang === "pt" ? "Queimação" : "Burning",
                      },
                      {
                        id: "touch",
                        label: lang === "pt" ? "Dor ao tocar" : "Pain to touch",
                      },
                      {
                        id: "movement",
                        label: lang === "pt" ? "Dor ao mexer" : "Pain on movement",
                      },
                      {
                        id: "impact",
                        label: lang === "pt" ? "Pancada / Batida" : "Impact / Hit",
                      },
                      {
                        id: "discomfort",
                        label: lang === "pt" ? "Incômodo leve" : "Mild discomfort",
                      },
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => toggleType(type.id)}
                        className={`p-2 rounded-lg text-sm font-medium transition-all border ${
                          tempType.includes(type.id)
                            ? "bg-cyan-500/20 text-cyan-400 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  {value[selectedPart.id] !== undefined && (
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 uppercase tracking-widest font-bold"
                      onClick={handleRemove}
                    >
                      {lang === "pt" ? "Remover" : "Remove"}
                    </Button>
                  )}
                  <Button
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    onClick={handleSave}
                    disabled={tempLevel === null}
                  >
                    {lang === "pt" ? "Salvar" : "Save"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
