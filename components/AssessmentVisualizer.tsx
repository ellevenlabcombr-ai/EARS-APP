import React, { useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell
} from 'recharts';
import { Activity, Box, CheckCircle, CircleDashed, Filter, Target, AlertTriangle, PlayCircle, AlignRight } from 'lucide-react';
import { translateKey } from '../lib/translations';

interface AssessmentVisualizerProps {
  data: any;
  type: string;
  language: string;
  selectedAssessment: any;
}

// Ignore these keys when parsing as they are usually handled by the main modal or are metadata
const IGNORED_KEYS = ['classification', 'classification_color', 'alerts', 'score', 'athlete_id', 'id', 'created_at', 'assessment_date', 'clinical_report', 'clinical_alerts', 'notes'];

export function AssessmentVisualizer({ data, type, language, selectedAssessment }: AssessmentVisualizerProps) {
  
  const { numericMetrics, nestedNumericGroups, textMetrics, booleanMetrics, arrayMetrics } = useMemo(() => {
    let numMet: { name: string; value: number; originalKey: string }[] = [];
    let nestedGroups: { name: string; originalKey: string; data: { subject: string, value: number, fullMark: number }[] }[] = [];
    let txtMet: { name: string; value: string }[] = [];
    let boolMet: { name: string; value: boolean }[] = [];
    let arrMet: { name: string; value: any[] }[] = [];

    const processObject = (obj: any, prefix = '') => {
      // Find objects that are basically records of numbers
      for (const [k, v] of Object.entries(obj)) {
        if (IGNORED_KEYS.includes(k) && prefix === '') continue;

        if (v === null || v === undefined) continue;

        const niceName = translateKey(k, language);

        if (typeof v === 'number') {
          numMet.push({ name: niceName, value: v, originalKey: k });
        } else if (typeof v === 'boolean') {
          boolMet.push({ name: niceName, value: v });
        } else if (typeof v === 'string') {
          // If it's a number string
          if (!isNaN(Number(v)) && v.trim() !== '') {
             numMet.push({ name: niceName, value: Number(v), originalKey: k });
          } else {
             txtMet.push({ name: niceName, value: v });
          }
        } else if (Array.isArray(v)) {
          arrMet.push({ name: niceName, value: v });
        } else if (typeof v === 'object') {
          // Check if it's a numeric group
          const subEntries = Object.entries(v).filter(([_, subV]) => typeof subV === 'number' || (typeof subV === 'string' && !isNaN(Number(subV))));
          const totalEntries = Object.keys(v).length;
          
          if (subEntries.length > 2 && subEntries.length === totalEntries) {
            // It's a pure numeric group! Radar chart material.
            const groupData = subEntries.map(([subK, subV]) => {
                const val = Number(subV);
                // Try to guess a max mark for the radar chart (10, 100, etc.)
                let max = 10;
                if (val > 10) max = 100;
                if (val > 100) max = 1000;
                
                return {
                    subject: translateKey(subK, language).substring(0, 15),
                    value: val,
                    fullMark: max
                };
            });
            nestedGroups.push({ name: niceName, data: groupData, originalKey: k });
          } else {
            // Flatten or just process children
            processObject(v, prefix ? `${prefix} - ${niceName}` : niceName);
          }
        }
      }
    };

    if (data && typeof data === 'object') {
      processObject(data);
    }

    return { numericMetrics: numMet, nestedNumericGroups: nestedGroups, textMetrics: txtMet, booleanMetrics: boolMet, arrayMetrics: arrMet };
  }, [data, language]);

  if (!data) return null;

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

  return (
    <div className="space-y-8 mt-6">
      
      {/* Nested Numeric Groups (Rendered as Radar Charts) */}
      {nestedNumericGroups.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {nestedNumericGroups.map((group, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target className="w-24 h-24 text-cyan-500" />
              </div>
              <h5 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-500" />
                {group.name}
              </h5>
              <div className="h-[250px] w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={group.data}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                    <Radar
                      name={group.name}
                      dataKey="value"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.3}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#06b6d4' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bar Chart for loose Numeric Metrics (if > 3 items) */}
      {numericMetrics.length >= 3 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden hover:border-cyan-500/30 transition-all duration-300">
            <h5 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5 text-cyan-500" />
                {language === 'pt' ? 'Métricas' : 'Metrics'}
            </h5>
            <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={numericMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                    axisLine={false} 
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontWeight: 'bold' }}
                    cursor={{ fill: '#1e293b', opacity: 0.4 }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {numericMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>
      )}

      {/* Grid for loosely numeric metrics if < 3 items or to supplement */}
      {numericMetrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {numericMetrics.map((metric, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 line-clamp-1" title={metric.name}>{metric.name}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-white">{metric.value}</p>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Val</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discrete text metrics */}
      {textMetrics.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 overflow-hidden">
            <h5 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlignRight className="w-5 h-5 text-emerald-500" />
                {language === 'pt' ? 'Dados Qualitativos' : 'Qualitative Data'}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {textMetrics.map((metric, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{metric.name}</p>
                        <p className="text-sm font-semibold text-slate-200">{metric.value}</p>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Boolean Metrics */}
      {booleanMetrics.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 overflow-hidden">
            <h5 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-amber-500" />
                {language === 'pt' ? 'Indicadores Binários' : 'Boolean Indicators'}
            </h5>
            <div className="flex flex-wrap gap-3">
                {booleanMetrics.map((metric, i) => (
                    <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${metric.value ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-800/30 border-slate-700 text-slate-500'}`}>
                        {metric.value ? <CheckCircle className="w-4 h-4" /> : <CircleDashed className="w-4 h-4" />}
                        <span className="text-xs font-bold uppercase tracking-wide">{metric.name}</span>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Array Metrics */}
      {arrayMetrics.length > 0 && (
        <div className="space-y-4">
          {arrayMetrics.map((arr, i) => {
            if (!arr.value || arr.value.length === 0) return null;
            return (
              <div key={i} className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 overflow-hidden">
                <h5 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Box className="w-5 h-5 text-indigo-500" />
                  {arr.name}
                </h5>
                <div className="flex flex-wrap gap-2">
                  {arr.value.map((item, j) => (
                    <span key={j} className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-slate-300">
                      {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
