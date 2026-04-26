import React, { useState, useEffect, useCallback } from 'react';
import { PosturalAnalysisTool, SegmentData } from './PosturalAnalysisTool';
import { X, Save, ArrowLeft, History, Plus, Trash2, Edit2, SplitSquareHorizontal, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { GoogleGenAI, Type } from '@google/genai';

interface PosturalForm {
  frontal: { url: string; file?: File; segments: SegmentData[] };
  dorsal: { url: string; file?: File; segments: SegmentData[] };
  lateralR: { url: string; file?: File; segments: SegmentData[] };
  lateralL: { url: string; file?: File; segments: SegmentData[] };
  notes: string;
}

interface PosturalAssessmentModalProps {
  athleteId: string;
  isOpen: boolean;
  onClose: () => void;
  supabase: any;
  onSaveSuccess: () => void;
  language: string;
}

export const FRONTAL_SEGMENTS = [
  { id: 'shoulders', label: 'Ombros' },
  { id: 'pelvis', label: 'Pelve / Cristas Ilíacas' },
  { id: 'knees', label: 'Joelhos' },
  { id: 'ankles', label: 'Tornozelos' }
];

export const LATERAL_SEGMENTS = [
  { id: 'head', label: 'Cabeça-Ombro' },
  { id: 'trunk', label: 'Ombro-Quadril' },
  { id: 'pelvis_knee', label: 'Quadril-Joelho' },
  { id: 'knee_ankle', label: 'Joelho-Tornozelo' }
];

export function PosturalAssessmentModal({
  athleteId,
  isOpen,
  onClose,
  supabase,
  onSaveSuccess,
  language
}: PosturalAssessmentModalProps) {
  const [form, setForm] = useState<PosturalForm>({
    frontal: { url: '', segments: [] },
    dorsal: { url: '', segments: [] },
    lateralR: { url: '', segments: [] },
    lateralL: { url: '', segments: [] },
    notes: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [viewState, setViewState] = useState<'form' | 'history' | 'compare'>('history');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [comparingIds, setComparingIds] = useState<string[]>([]);
  
  const [isGeneratingAIReport, setIsGeneratingAIReport] = useState(false);
  const [aiReport, setAiReport] = useState<{report: string, actions: string, alerts: string[]} | null>(null);

  const t = (pt: string, en: string) => language === 'en' ? en : pt;

  const generateIsolatedPosturalReport = async (rawData: any, notes: string) => {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) return null;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const prompt = `
        Você é um especialista em biomecânica e fisioterapia esportiva de elite.
        Estou fornecendo uma avaliação postural de um atleta.
        
        - Notas do fisioterapeuta: ${notes || "Nenhuma nota"}
        - Desvios segmentares encontrados: ${JSON.stringify(rawData)}
        
        Sua tarefa é analisar os dados e gerar 3 saídas (em ${language === 'en' ? 'Inglês' : 'Português'}):
        1. Resumo Clínico: Um texto muito suscinto e direto (Markdown) diagnosticando as principais alterações posturais.
        2. Condutas e Correções: Um texto (Markdown) focado em ações corretivas (exercícios, liberações).
        3. Alertas Principais: Uma lista de strings com alertas rápidos para o fisioterapeuta atuar.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              report: { type: Type.STRING },
              actions: { type: Type.STRING },
              alerts: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["report", "actions", "alerts"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("AI Isolated Report Error:", error);
      return null;
    }
  };

  const fetchHistory = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('postural_assessments')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('assessment_date', { ascending: false });
    if (data) {
      setHistory(data);
    }
  }, [supabase, athleteId]);

   
  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      setViewState('history');
      resetForm();
      setComparingIds([]);
    }
  }, [isOpen, athleteId, fetchHistory]);

  const uploadImage = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `postural/${athleteId}/${path}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return publicUrl;
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('Tem certeza que deseja excluir esta avaliação?', 'Are you sure you want to delete this assessment?'))) return;
    if (!supabase) return;
    
    try {
      const { error } = await supabase.from('postural_assessments').delete().eq('id', id);
      if (error) throw error;
      await fetchHistory();
      onSaveSuccess();
    } catch (e) {
      console.error(e);
      alert(t('Erro ao excluir avaliação.', 'Error deleting assessment.'));
    }
  };

  const handleEdit = (assessment: any) => {
    setEditingId(assessment.id);
    const raw = assessment.raw_data || {};
    setForm({
      frontal: { url: raw.frontal?.url || '', segments: raw.frontal?.segments || [] },
      dorsal: { url: raw.dorsal?.url || '', segments: raw.dorsal?.segments || [] },
      lateralR: { url: raw.lateralR?.url || '', segments: raw.lateralR?.segments || [] },
      lateralL: { url: raw.lateralL?.url || '', segments: raw.lateralL?.segments || [] },
      notes: raw.notes || assessment.notes || ''
    });
    setViewState('form');
  };

  const toggleCompare = (id: string) => {
    setComparingIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const generateAIComparisonReport = async () => {
    if (comparingIds.length !== 2) return;
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      alert("Gemini API key not found.");
      return;
    }

    try {
      setIsGeneratingAIReport(true);
      setAiReport(null);
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const assessment1 = history.find(a => a.id === comparingIds[0]);
      const assessment2 = history.find(a => a.id === comparingIds[1]);

      if (!assessment1 || !assessment2) return;

      const prompt = `
        Você é um especialista em biomecânica e fisioterapia esportiva de elite.
        Estou comparando duas avaliações posturais do mesmo atleta, mas em datas diferentes.
        
        Availiação 1 (Data: ${new Date(assessment1.assessment_date).toLocaleDateString()}):
        - Notas do fisioterapeuta: ${assessment1.notes || "Nenhuma nota"}
        - Desvios segmentares encontrados (visão computacional/fisioterapêutica): ${JSON.stringify(assessment1.raw_data)}
        
        Availiação 2 (Data: ${new Date(assessment2.assessment_date).toLocaleDateString()}):
        - Notas do fisioterapeuta: ${assessment2.notes || "Nenhuma nota"}
        - Desvios segmentares encontrados (visão computacional/fisioterapêutica): ${JSON.stringify(assessment2.raw_data)}
        
        Sua tarefa é analisar as duas avaliações posturais e gerar 3 coisas separadas (em ${language === 'en' ? 'Inglês' : 'Português'}):
        1. Resumo da Comparação: Um texto muito suscinto, objetivo e direto (formato Markdown) apontando exclusivamente a comparação entre as duas datas (melhoras, compensações novas ou instabilidades) e a base clínica para os padrões achados. Deve ser objetivo e prático.
        2. Condutas e Correções: Um texto (Markdown) focado apenas nas ações que precisam ser tomadas para correções (exercícios, terapias manuais, alongamentos) com base na evolução.
        3. Alertas Principais: Uma lista de strings com alertas rápidos para o fisioterapeuta atuar (ex: "Aumento da anteriorização cervical", "Assimetria de ombro piorou").
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              report: { type: Type.STRING },
              actions: { type: Type.STRING },
              alerts: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["report", "actions", "alerts"]
          }
        }
      });

      const parsedResponse = JSON.parse(response.text || "{}");
      setAiReport({
        report: parsedResponse.report || "Não foi possível gerar a comparação.",
        actions: parsedResponse.actions || "Nenhuma conduta gerada.",
        alerts: parsedResponse.alerts || []
      });
    } catch (error) {
      console.error("AI Error:", error);
      setAiReport(null);
      alert(t("Erro ao gerar o relatório comparativo.", "Error generating comparison report."));
    } finally {
      setIsGeneratingAIReport(false);
    }
  };

  const handleSave = async () => {
    if (!supabase) return;
    setIsSaving(true);
    try {
      const uploads = {
        frontal: form.frontal.url,
        dorsal: form.dorsal.url,
        lateralR: form.lateralR.url,
        lateralL: form.lateralL.url
      };

      if (form.frontal.file) uploads.frontal = await uploadImage(form.frontal.file, 'frontal');
      if (form.dorsal.file) uploads.dorsal = await uploadImage(form.dorsal.file, 'dorsal');
      if (form.lateralR.file) uploads.lateralR = await uploadImage(form.lateralR.file, 'lateral_r');
      if (form.lateralL.file) uploads.lateralL = await uploadImage(form.lateralL.file, 'lateral_l');

      const rawData = {
        frontal: { url: uploads.frontal, segments: form.frontal.segments },
        dorsal: { url: uploads.dorsal, segments: form.dorsal.segments },
        lateralR: { url: uploads.lateralR, segments: form.lateralR.segments },
        lateralL: { url: uploads.lateralL, segments: form.lateralL.segments },
        notes: form.notes
      };

      const primaryUrl = uploads.frontal || uploads.dorsal || uploads.lateralR || uploads.lateralL || '';
      
      const aiReportResult = await generateIsolatedPosturalReport(rawData, form.notes);

      if (editingId) {
        const { error } = await supabase.from('postural_assessments').update({
          raw_data: rawData,
          notes: form.notes,
          image_url: primaryUrl,
          ...(aiReportResult ? {
            clinical_report: aiReportResult.report,
            clinical_alerts: aiReportResult.alerts ? aiReportResult.alerts.map((a: string) => ({ type: 'warning', message: a, priority: 'Media' })) : [],
            // We can add actions to raw_data or notes, or clinical_actions if it exists.
            // But let's add it to raw_data so we don't break schema if clinical_actions column doesn't exist
            raw_data: { ...rawData, ai_actions: aiReportResult.actions }
          } : {})
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('postural_assessments').insert({
          athlete_id: athleteId,
          score: 100, 
          classification: 'Realizado',
          classification_color: '#0ea5e9',
          raw_data: aiReportResult ? { ...rawData, ai_actions: aiReportResult.actions } : rawData,
          notes: form.notes,
          image_url: primaryUrl,
          ...(aiReportResult ? {
            clinical_report: aiReportResult.report,
            clinical_alerts: aiReportResult.alerts ? aiReportResult.alerts.map((a: string) => ({ type: 'warning', message: a, priority: 'Media' })) : []
          } : {})
        });
        if (error) throw error;
      }

      onSaveSuccess();
      setEditingId(null);
      await fetchHistory();
      setViewState('history');
      resetForm();
    } catch (e) {
      console.error(e);
      alert(t('Erro ao salvar avaliação postural.', 'Error saving postural assessment.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (key: keyof PosturalForm, file: File) => {
    const url = URL.createObjectURL(file);
    setForm(prev => ({
      ...prev,
      [key]: { url, file, segments: [] }
    }));
  };

  const handleSegmentsChange = (key: keyof PosturalForm, segments: SegmentData[]) => {
    setForm(prev => ({
      ...prev,
      [key]: { ...(prev[key] as any), segments }
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      frontal: { url: '', segments: [] },
      dorsal: { url: '', segments: [] },
      lateralR: { url: '', segments: [] },
      lateralL: { url: '', segments: [] },
      notes: ''
    });
  };

  const renderHistoryDetails = (rawData: any) => {
    if (!rawData) return null;
    return (
      <div className="w-full flex flex-col gap-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rawData.frontal?.url && (
            <PosturalAnalysisTool 
              label={t("Visão Frontal", "Frontal View")} 
              imageUrl={rawData.frontal.url} 
              onImageChange={() => {}} 
              segments={rawData.frontal.segments || []} 
              onSegmentsChange={() => {}} 
              availableSegmentDefinitions={FRONTAL_SEGMENTS}
              readOnly 
            />
          )}
          {rawData.dorsal?.url && (
            <PosturalAnalysisTool 
              label={t("Visão Dorsal", "Dorsal View")} 
              imageUrl={rawData.dorsal.url} 
              onImageChange={() => {}} 
              segments={rawData.dorsal.segments || []} 
              onSegmentsChange={() => {}} 
              availableSegmentDefinitions={FRONTAL_SEGMENTS}
              readOnly 
            />
          )}
          {rawData.lateralR?.url && (
            <PosturalAnalysisTool 
              label={t("Lateral Direita", "Right Lateral")} 
              imageUrl={rawData.lateralR.url} 
              onImageChange={() => {}} 
              segments={rawData.lateralR.segments || []} 
              onSegmentsChange={() => {}} 
              availableSegmentDefinitions={LATERAL_SEGMENTS}
              readOnly 
            />
          )}
          {rawData.lateralL?.url && (
            <PosturalAnalysisTool 
              label={t("Lateral Esquerda", "Left Lateral")} 
              imageUrl={rawData.lateralL.url} 
              onImageChange={() => {}} 
              segments={rawData.lateralL.segments || []} 
              onSegmentsChange={() => {}} 
              availableSegmentDefinitions={LATERAL_SEGMENTS}
              readOnly 
            />
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-950/95 backdrop-blur-xl">
      <div className="bg-[#0A1120] border border-slate-800 w-full h-full max-w-6xl rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-4">
            {(viewState === 'form' || viewState === 'compare') && (
              <Button variant="ghost" size="icon" onClick={() => setViewState('history')} className="text-slate-400">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h3 className="text-xl font-black text-white uppercase tracking-tight">
              {t('Avaliação Postural', 'Postural Assessment')}
            </h3>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {viewState === 'history' ? (
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-500" />
                  {t('Histórico', 'History')}
                </h4>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {comparingIds.length === 2 && (
                    <Button onClick={() => setViewState('compare')} className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-black uppercase text-xs flex-1 sm:flex-none">
                      <SplitSquareHorizontal className="w-4 h-4 mr-2" />
                      {t('Comparar Selecionadas', 'Compare Selected')}
                    </Button>
                  )}
                  <Button onClick={() => { resetForm(); setViewState('form'); }} className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black uppercase text-xs flex-1 sm:flex-none">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('Nova Avaliação', 'New Assessment')}
                  </Button>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-sm font-medium text-slate-500">
                    {t('Nenhuma avaliação postural encontrada.', 'No postural assessments found.')}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {history.map(assessment => (
                    <div key={assessment.id} className={`bg-slate-900/50 border ${comparingIds.includes(assessment.id) ? 'border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.15)] bg-slate-900/80' : 'border-slate-800'} rounded-2xl p-6 transition-all duration-300`}>
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox"
                              checked={comparingIds.includes(assessment.id)}
                              onChange={() => toggleCompare(assessment.id)}
                              className="w-5 h-5 rounded border-slate-700 text-fuchsia-500 focus:ring-fuchsia-500 focus:ring-offset-slate-950 bg-slate-800 cursor-pointer" 
                            />
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${comparingIds.includes(assessment.id) ? 'bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.8)]' : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]'}`} />
                              <h5 className={`font-bold uppercase tracking-widest ${comparingIds.includes(assessment.id) ? 'text-fuchsia-400' : 'text-white'}`}>
                                {new Date(assessment.assessment_date).toLocaleDateString()}
                              </h5>
                            </div>
                          </label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(assessment)} className="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800">
                            <Edit2 className="w-4 h-4 mr-2" />
                            {t('Editar', 'Edit')}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(assessment.id)} className="text-rose-500 hover:text-white hover:bg-rose-500/20 bg-slate-800/50">
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('Excluir', 'Delete')}
                          </Button>
                        </div>
                      </div>
                      
                      {assessment.notes && (
                        <div className="mb-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
                          <p className="text-xs text-slate-400 font-medium">Notas da Avaliação</p>
                          <p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap">{assessment.notes}</p>
                        </div>
                      )}

                      {/* We will render the components here with readOnly mode to showcase the history */}
                      {renderHistoryDetails(assessment.raw_data)}

                      {/* Isolated AI Report Features */}
                      {assessment.clinical_report && (
                         <div className="mt-4 bg-slate-900 border border-purple-500/30 rounded-xl p-5 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                            <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest border-b border-purple-900/30 pb-2 mb-3 flex items-center gap-2">
                               <Sparkles className="w-4 h-4" />
                               {t('Resumo Clínico (IA)', 'AI Clinical Summary')}
                            </h4>
                            <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-medium">
                               {assessment.clinical_report}
                            </div>
                         </div>
                      )}
                      {assessment.raw_data?.ai_actions && (
                         <div className="mt-4 bg-slate-900 border border-cyan-500/30 rounded-xl p-5 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                            <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest border-b border-cyan-900/30 pb-2 mb-3 flex items-center gap-2">
                               <Sparkles className="w-4 h-4" />
                               {t('Condutas Sugeridas', 'Suggested Actions')}
                            </h4>
                            <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-medium">
                               {assessment.raw_data.ai_actions}
                            </div>
                         </div>
                      )}
                      {assessment.clinical_alerts && assessment.clinical_alerts.length > 0 && (
                         <div className="mt-4 bg-slate-900 border border-rose-500/30 rounded-xl p-5 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                            <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest border-b border-rose-900/30 pb-2 mb-3 flex items-center gap-2">
                               <Sparkles className="w-4 h-4" />
                               {t('Alertas Críticos', 'Critical Alerts')}
                            </h4>
                            <ul className="space-y-2">
                               {assessment.clinical_alerts.map((al: any, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-rose-300 font-medium">
                                     <span className="text-rose-500 mt-0.5">•</span>
                                     {al.message}
                                  </li>
                               ))}
                            </ul>
                         </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : viewState === 'compare' ? (
            <div className="flex flex-col h-full gap-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h4 className="text-sm font-black text-fuchsia-400 uppercase tracking-widest flex items-center gap-2">
                  <SplitSquareHorizontal className="w-4 h-4" />
                  {t('Comparação Lado a Lado', 'Side-by-Side Comparison')}
                </h4>
                <Button 
                  onClick={generateAIComparisonReport} 
                  disabled={isGeneratingAIReport}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-black uppercase text-xs w-full sm:w-auto"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGeneratingAIReport ? t('Analisando...', 'Analyzing...') : t('Gerar Relatório de Evolução', 'Generate Evolution Report')}
                </Button>
              </div>

              {aiReport && (
                <div className="flex flex-col gap-4">
                  {/* Summary Box */}
                  <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                    <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest border-b border-purple-900/30 pb-3 mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {t('Resumo da Comparação', 'Comparison Summary')}
                    </h4>
                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                      {aiReport.report}
                    </div>
                  </div>

                  {/* Actions / Condutas Box */}
                  <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                    <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest border-b border-cyan-900/30 pb-3 mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {t('Condutas & Correções', 'Clinical Actions')}
                    </h4>
                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                      {aiReport.actions}
                    </div>
                  </div>

                  {/* Alerts Box */}
                  {aiReport.alerts && aiReport.alerts.length > 0 && (
                    <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                      <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest border-b border-rose-900/30 pb-3 mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {t('Alertas Principais', 'Main Alerts')}
                      </h4>
                      <ul className="flex flex-col gap-2">
                        {aiReport.alerts.map((alert, i) => (
                          <li key={i} className="text-sm text-rose-300 font-medium flex items-start gap-2">
                            <span className="text-rose-500 mt-0.5">•</span> 
                            {alert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="w-full flex space-x-6 overflow-x-auto snap-x flex-1 pb-4 custom-scrollbar">
                {comparingIds.map(id => {
                  const assessment = history.find(a => a.id === id);
                  if (!assessment) return null;
                  return (
                    <div key={id} className="min-w-fit md:min-w-[500px] w-full max-w-full flex-1 flex flex-col gap-4 border border-slate-800 bg-slate-900/50 rounded-2xl p-6 snap-center">
                      <div className="flex items-center gap-3 mb-2 border-b border-slate-800 pb-4">
                        <div className="w-3 h-3 rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)]" />
                        <h4 className="font-black text-white text-lg uppercase tracking-tight">
                          {new Date(assessment.assessment_date).toLocaleDateString()}
                        </h4>
                      </div>
                      {assessment.notes && (
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                          <p className="text-xs text-slate-400 font-medium pb-1">Notas da Avaliação</p>
                          <p className="text-sm text-slate-300 whitespace-pre-wrap">{assessment.notes}</p>
                        </div>
                      )}
                      {renderHistoryDetails(assessment.raw_data)}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <PosturalAnalysisTool 
                  label={t('Visão Frontal', 'Frontal View')} 
                  imageUrl={form.frontal.url}
                  onImageChange={(f) => handleImageChange('frontal', f)}
                  segments={form.frontal.segments}
                  onSegmentsChange={(s) => handleSegmentsChange('frontal', s)}
                  availableSegmentDefinitions={FRONTAL_SEGMENTS}
                />
                <PosturalAnalysisTool 
                  label={t('Visão Dorsal', 'Dorsal View')} 
                  imageUrl={form.dorsal.url}
                  onImageChange={(f) => handleImageChange('dorsal', f)}
                  segments={form.dorsal.segments}
                  onSegmentsChange={(s) => handleSegmentsChange('dorsal', s)}
                  availableSegmentDefinitions={FRONTAL_SEGMENTS}
                />
                <PosturalAnalysisTool 
                  label={t('Lateral Direita', 'Right Lateral')} 
                  imageUrl={form.lateralR.url}
                  onImageChange={(f) => handleImageChange('lateralR', f)}
                  segments={form.lateralR.segments}
                  onSegmentsChange={(s) => handleSegmentsChange('lateralR', s)}
                  availableSegmentDefinitions={LATERAL_SEGMENTS}
                />
                <PosturalAnalysisTool 
                  label={t('Lateral Esquerda', 'Left Lateral')} 
                  imageUrl={form.lateralL.url}
                  onImageChange={(f) => handleImageChange('lateralL', f)}
                  segments={form.lateralL.segments}
                  onSegmentsChange={(s) => handleSegmentsChange('lateralL', s)}
                  availableSegmentDefinitions={LATERAL_SEGMENTS}
                />
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">
                  {t('Raciocínio Clínico / Notas', 'Clinical Reasoning / Notes')}
                </h4>
                <textarea 
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({...prev, notes: e.target.value}))}
                  className="w-full h-32 bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-cyan-500 outline-none resize-none"
                  placeholder={t('Descreva os achados posturais e correções...', 'Describe postural findings and corrections...')}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {viewState === 'form' && (
          <div className="p-6 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end gap-4">
            <Button variant="ghost" onClick={() => setViewState('history')} disabled={isSaving} className="text-slate-400">
              {t('Cancelar', 'Cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black uppercase text-xs">
              {isSaving ? t('Salvando...', 'Saving...') : editingId ? t('Atualizar Avaliação', 'Update Assessment') : t('Salvar Avaliação', 'Save Assessment')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

