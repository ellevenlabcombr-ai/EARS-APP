const fs = require('fs');
let code = fs.readFileSync('components/AthleteHealthProfile.tsx', 'utf8');

const endMainText = `            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </main>

      {/* Postural Assessment Modal */}`;

const startIdx = code.lastIndexOf(endMainText);
if (startIdx === -1) {
    console.log("Could not find end main markers.");
    process.exit(1);
}

const replacement = `            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
          </div> {/* End Left Column */}

          {/* RIGHT COLUMN: Summary Sidebar */}
          <div className="space-y-6 lg:col-span-1 border-l border-slate-800/50 pl-6 sticky top-24 h-max">
             {/* Clinical Risk Summary */}
             <div className={\`p-6 rounded-3xl border-2 \${riskCfg.color.replace('text-', 'border-').replace('400', '500/30')} \${riskCfg.bg} backdrop-blur-xl shadow-2xl flex flex-col items-center gap-2 w-full\`}>
                <div className={\`w-3 h-3 rounded-full \${riskCfg.color.replace('text-', 'bg-')} animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.5)]\`}></div>
                <p className="text-xxs font-black text-slate-500 uppercase tracking-[0.2em]">Risco Clínico Atual</p>
                <span className={\`text-2xl font-black uppercase tracking-widest \${riskCfg.color}\`}>
                  {riskCfg.label}
                </span>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center text-center">
                    <span className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Status</span>
                    <span className={\`text-xs font-black uppercase tracking-tighter \${statusCfg.color}\`}>{statusCfg.label}</span>
                 </div>
                 <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center text-center">
                    <span className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Prontidão</span>
                    <span className={\`text-xl font-black \${athlete.readiness < 70 ? 'text-rose-500' : 'text-cyan-400'}\`}>{athlete.readiness}%</span>
                 </div>
             </div>

             {/* Recent Tags */}
             <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-5 space-y-4">
                <h3 className="text-xxs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Tag className="w-3.5 h-3.5 text-purple-400" /> Tags Ativas
                </h3>
                <div className="flex flex-wrap gap-1.5">
                   {clinicalTags.length > 0 ? (
                      clinicalTags.map(tag => (
                         <span key={tag.id} className="text-[9px] px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase font-black tracking-widest">{tag.tag}</span>
                      ))
                   ) : (
                      <span className="text-[10px] text-slate-600 font-bold italic">Nenhuma tag ativa.</span>
                   )}
                </div>
             </div>

             {/* Focus Action Planner */}
             <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-5 space-y-4">
                <h3 className="text-xxs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Target className="w-3.5 h-3.5 text-rose-500" /> Foco de Recuperação
                </h3>
                <div className="space-y-3">
                   {athleteAlerts.filter(a => a.status === 'active').slice(0, 3).map(alert => (
                     <div key={alert.id} className="flex gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="text-[10px] font-bold text-slate-300 leading-tight">{alert.message}</span>
                     </div>
                   ))}
                   {athleteAlerts.filter(a => a.status === 'active').length === 0 && (
                      <span className="text-[10px] text-slate-600 font-bold italic">Nenhum foco de risco.</span>
                   )}
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Postural Assessment Modal */}`;

code = code.substring(0, startIdx) + replacement + code.substring(startIdx + endMainText.length);
fs.writeFileSync('components/AthleteHealthProfile.tsx', code);
console.log("Successfully replaced Main End.");
