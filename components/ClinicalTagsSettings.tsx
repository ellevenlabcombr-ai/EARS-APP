"use client";
import React, { useState, useEffect } from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { Button } from './ui/button';

export function ClinicalTagsSettings() {
  const [tags, setTags] = useState<{id: string, tag: string, source: string}[]>([]);
  const [newTagText, setNewTagText] = useState("");
  const [newTagSource, setNewTagSource] = useState<'clinical' | 'field_observation'>('clinical');

  useEffect(() => {
    const saved = localStorage.getItem('system_clinical_tags');
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTags(JSON.parse(saved));
    }
  }, []);

  const saveTags = (newTags: typeof tags) => {
    setTags(newTags);
    localStorage.setItem('system_clinical_tags', JSON.stringify(newTags));
  };

  const handleAdd = () => {
    if (!newTagText.trim()) return;
    const newTag = {
      id: Math.random().toString(36).substr(2, 9),
      tag: newTagText.trim(),
      source: newTagSource
    };
    saveTags([...tags, newTag]);
    setNewTagText("");
  };

  const handleRemove = (id: string) => {
    saveTags(tags.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1 flex items-center gap-2">
           <Tag className="w-4 h-4 text-purple-500" />
           Tags Clínicas do Sistema
        </h3>
        <p className="text-xs text-slate-400 font-medium">Defina as tags padrões que podem ser atribuídas aos atletas.</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 p-4 bg-slate-900/50 rounded-xl border border-slate-800/50 min-h-[100px]">
          {tags.map((tag) => (
            <div key={tag.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-sm ${tag.source === 'field_observation' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
               <span className="text-[10px] font-black uppercase tracking-widest">{tag.tag}</span>
               <button onClick={() => handleRemove(tag.id)} className="hover:text-rose-400 hover:bg-rose-500/10 p-1 rounded transition-colors ml-1 focus:outline-none">
                 <X className="w-3 h-3" />
               </button>
            </div>
          ))}
          {tags.length === 0 && (
            <div className="text-[10px] text-slate-500 font-bold italic py-2 w-full text-center">
              Nenhuma tag configurada
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input 
            type="text" 
            placeholder="Nome da Nova Tag..." 
            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-xs font-medium text-white focus:outline-none focus:border-purple-500/50 transition-colors"
            value={newTagText}
            onChange={(e) => setNewTagText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <select 
            value={newTagSource} 
            onChange={(e) => setNewTagSource(e.target.value as any)}
            className="w-full sm:w-48 bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none"
          >
            <option value="clinical">Clínico</option>
            <option value="field_observation">Campo</option>
          </select>
          <Button onClick={handleAdd} className="w-full sm:w-auto bg-purple-500 hover:bg-purple-400 text-white font-bold uppercase tracking-widest text-xs px-6 py-5 rounded-lg">
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}
