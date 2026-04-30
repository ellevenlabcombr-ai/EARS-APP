import re

with open('components/AnthropometricAssessmentForm.tsx', 'r') as f:
    code = f.read()

replacement = """  const formSteps = [
    { id: 1, title: 'Básicos', icon: Activity },
    { id: 2, title: 'Perímetros', icon: Scaling },
    { id: 3, title: 'Dobras', icon: Sigma },
    { id: 4, title: 'Resultado', icon: Save },
  ];

  return (
    <div className="flex flex-col h-full bg-[#050B14] overflow-hidden text-slate-200" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 pb-2 shrink-0 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Ruler className="w-6 h-6 text-indigo-400" />
          </div>
          <TestInfoModal
            title="Avaliação Antropométrica Avançada"
            indication="Monitoramento da composição corporal, assimetrias e adiposidade com foco dinâmico em desenvolvimento infanto-juvenil."
            application="O avaliador utiliza adipômetro para coletar as dobras e trena/fita para perímetros. A equação de Slaughter (1988) será usada para < 14 anos, e J&P ajustado para adultos."
            referenceValues={["WHtR < 0.5 (Ideal)", "Gordura Meninos < 25%, Meninas < 32%", "Assimetria < 1.5cm"]}
            deficitGrades={["Alteração Crítica (Assimetria > 3%)", "Gordura ou RCQ elevado alertando para Risco Metabólico precoce."]}
          >
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight hover:text-cyan-400 transition-colors cursor-pointer">Avaliação Antropométrica</h2>
              <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest truncate">Métricas por Idade & Maturação</p>
            </div>
          </TestInfoModal>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-500 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-start md:justify-between gap-4 md:gap-0 overflow-x-auto no-scrollbar px-4 sm:px-6 py-4 my-2 w-full max-w-4xl mx-auto shrink-0">
        {formSteps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div 
              className={`flex flex-col items-center gap-2 cursor-pointer transition-all shrink-0 ${step === s.id ? 'scale-110' : 'opacity-40'}`}
              onClick={() => setStep(s.id as any)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-700 text-slate-500'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[0.6rem] md:text-xs font-black uppercase tracking-widest text-center max-w-[5rem] md:max-w-[7rem] leading-tight mt-1">{s.title}</span>
            </div>
            {i < formSteps.length - 1 && (
              <div className={`w-8 md:flex-1 h-[2px] shrink-0 mb-8 mx-2 ${step > s.id ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-32 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8 h-full">

          {/* TAB 1: Básicos */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800/50 flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Idade Calculada</label>
                  <input type="number" min="6" max="99" value={basicInfo.age} onChange={e => setBasicInfo({ ...basicInfo, age: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="flex-[2]">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Sexo Biológico</label>
                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setBasicInfo({ ...basicInfo, sex: 'M' })} className={`flex-1 h-12 border ${basicInfo.sex === 'M' ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-800 text-slate-400 hover:text-white'}`}>Masculino</Button>
                    <Button variant="ghost" onClick={() => setBasicInfo({ ...basicInfo, sex: 'F' })} className={`flex-1 h-12 border ${basicInfo.sex === 'F' ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-800 text-slate-400 hover:text-white'}`}>Feminino</Button>
                  </div>
                </div>
                <div className="flex-[2]">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                    <span>Estágio de Tanner</span>
                    <span className="text-indigo-400">{basicInfo.tannerStage}/5</span>
                  </label>
                  <input type="range" min="1" max="5" value={basicInfo.tannerStage} onChange={e => setBasicInfo({ ...basicInfo, tannerStage: Number(e.target.value) })} className="w-full accent-indigo-500 mt-2" />
                  <div className="flex justify-between text-xs text-slate-500 mt-2 px-1 font-bold tracking-widest uppercase">
                    <span>Pré-púbere (1)</span>
                    <span>Púbere (3)</span>
                    <span>Adulto (5)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NumberInput label="Massa Corporal" value={measurements.weight} unit="kg" onChange={(v) => setMeasurements({...measurements, weight: v})} />
                <NumberInput label="Estatura" value={measurements.height} unit="cm" onChange={(v) => setMeasurements({...measurements, height: v})} />
                <NumberInput label="Altura Tronco-Cef." value={measurements.sittingHeight} unit="cm" onChange={(v) => setMeasurements({...measurements, sittingHeight: v})} />
                <NumberInput label="Envergadura" value={measurements.wingspan} unit="cm" onChange={(v) => setMeasurements({...measurements, wingspan: v})} />
              </div>
            </div>
          )}

          {/* TAB 2: Perímetros */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Tronco */}
                 <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/50 space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                      <Sigma className="w-4 h-4 text-cyan-500" />
                      Perímetros do Tronco
                    </h3>
                    <div className="space-y-3">
                      <NumberInput label="Pescoço" value={measurements.neck} unit="cm" onChange={(v) => setMeasurements({...measurements, neck: v})} />
                      <NumberInput label="Ombros" value={measurements.shoulders} unit="cm" onChange={(v) => setMeasurements({...measurements, shoulders: v})} />
                      <NumberInput label="Tórax" value={measurements.chest} unit="cm" onChange={(v) => setMeasurements({...measurements, chest: v})} />
                      <NumberInput label="Cintura" value={measurements.waist} unit="cm" onChange={(v) => setMeasurements({...measurements, waist: v})} />
                      <NumberInput label="Abdômen" value={measurements.abdomen} unit="cm" onChange={(v) => setMeasurements({...measurements, abdomen: v})} />
                      <NumberInput label="Quadril" value={measurements.hip} unit="cm" onChange={(v) => setMeasurements({...measurements, hip: v})} />
                    </div>
                 </div>

                 {/* Membros Superiores */}
                 <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/50 space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                       <Ruler className="w-4 h-4 text-amber-500" />
                       Membros Superiores (CM)
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-2 px-1">
                       <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Direito</div>
                       <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Esquerdo</div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block text-center">Braço Relaxado</label>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" value={measurements.rightArmRelaxed || ''} onChange={e => setMeasurements({...measurements, rightArmRelaxed: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-2 text-white font-bold text-sm focus:border-indigo-500 outline-none text-center" />
                          <input type="number" value={measurements.leftArmRelaxed || ''} onChange={e => setMeasurements({...measurements, leftArmRelaxed: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-2 text-white font-bold text-sm focus:border-indigo-500 outline-none text-center" />
                        </div>
                      </div>

                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block text-center">Braço Contraído</label>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" value={measurements.rightArmFlexed || ''} onChange={e => setMeasurements({...measurements, rightArmFlexed: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-2 text-white font-bold text-sm focus:border-amber-500 outline-none text-center" />
                          <input type="number" value={measurements.leftArmFlexed || ''} onChange={e => setMeasurements({...measurements, leftArmFlexed: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-2 text-white font-bold text-sm focus:border-amber-500 outline-none text-center" />
                        </div>
                      </div>

                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block text-center">Antebraço</label>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" value={measurements.rightForearm || ''} onChange={e => setMeasurements({...measurements, rightForearm: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-2 text-white font-bold text-sm focus:border-indigo-500 outline-none text-center" />
                          <input type="number" value={measurements.leftForearm || ''} onChange={e => setMeasurements({...measurements, leftForearm: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-2 text-white font-bold text-sm focus:border-indigo-500 outline-none text-center" />
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* Membros Inferiores */}
                 <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/50 space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                       <Ruler className="w-4 h-4 text-rose-500" />
                       Membros Inferiores (CM)
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-2 px-1">
                       <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Direito</div>
                       <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Esquerdo</div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block text-center">Coxa Medial</label>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" value={measurements.rightThigh || ''} onChange={e => setMeasurements({...measurements, rightThigh: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-2 text-white font-bold text-sm focus:border-rose-500 outline-none text-center" />
                          <input type="number" value={measurements.leftThigh || ''} onChange={e => setMeasurements({...measurements, leftThigh: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-2 text-white font-bold text-sm focus:border-rose-500 outline-none text-center" />
                        </div>
                      </div>

                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block text-center">Panturrilha</label>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" value={measurements.rightCalf || ''} onChange={e => setMeasurements({...measurements, rightCalf: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-2 text-white font-bold text-sm focus:border-rose-500 outline-none text-center" />
                          <input type="number" value={measurements.leftCalf || ''} onChange={e => setMeasurements({...measurements, leftCalf: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-2 text-white font-bold text-sm focus:border-rose-500 outline-none text-center" />
                        </div>
                      </div>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* TAB 3: Dobras */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <NumberInput label="Tricipital" value={skinfolds.triceps} unit="mm" onChange={(v) => setSkinfolds({...skinfolds, triceps: v})} />
                 <NumberInput label="Subescapular" value={skinfolds.subscapular} unit="mm" onChange={(v) => setSkinfolds({...skinfolds, subscapular: v})} />
                 <NumberInput label="Torácica (Peitoral)" value={skinfolds.chest} unit="mm" onChange={(v) => setSkinfolds({...skinfolds, chest: v})} />
                 <NumberInput label="Axilar Média" value={skinfolds.axillary} unit="mm" onChange={(v) => setSkinfolds({...skinfolds, axillary: v})} />
                 <NumberInput label="Suprailíaca" value={skinfolds.suprailiac} unit="mm" onChange={(v) => setSkinfolds({...skinfolds, suprailiac: v})} />
                 <NumberInput label="Abdominal" value={skinfolds.abdomen} unit="mm" onChange={(v) => setSkinfolds({...skinfolds, abdomen: v})} />
                 <NumberInput label="Coxa" value={skinfolds.thigh} unit="mm" onChange={(v) => setSkinfolds({...skinfolds, thigh: v})} />
              </div>
            </div>
          )}

          {/* TAB 4: Resultado */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="p-8 text-center border-b border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-black mb-2">Simetria & Perimetria</p>
                  <div className="text-7xl font-black text-white mb-3 tracking-tighter">{score}</div>
                  <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getColorClasses(classification.color)}`}>
                    {classification.label}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 p-8 gap-4 bg-black/20">
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gordura Est.</p>
                    <p className="text-2xl font-black text-cyan-400">{metrics.fatPercentage}%</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Massa Magra</p>
                    <p className="text-2xl font-black text-indigo-400">{metrics.muscleMass}kg</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cintura/Altura</p>
                    <p className={`text-2xl font-black ${metrics.whtr < 0.5 ? 'text-emerald-400' : 'text-rose-400'}`}>{metrics.whtr}</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">RCQ</p>
                    <p className={`text-2xl font-black ${metrics.whr < 0.85 ? 'text-emerald-400' : metrics.whr <= 0.9 ? 'text-amber-400' : 'text-rose-400'}`}>{metrics.whr}</p>
                  </div>
                </div>

                {(alerts.length > 0 || (metrics.armAsymmetry > 0 || metrics.thighAsymmetry > 0 || metrics.calfAsymmetry > 0)) && (
                  <div className="p-8 space-y-6">
                    {alerts.length > 0 && (
                      <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">Alertas Cinesiométricos</h4>
                        <ul className="space-y-2">
                          {alerts.map((alert, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-slate-300 bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg">
                              <AlertTriangle className="w-4 h-4 text-rose-500" /> {alert}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {metrics.armAsymmetry > 0 && (
                        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50 text-center">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Assimetria Braços</p>
                          <p className={`text-lg font-black ${metrics.armAsymmetry > 5 ? 'text-rose-400' : 'text-slate-300'}`}>{metrics.armAsymmetry}%</p>
                        </div>
                      )}
                      {metrics.thighAsymmetry > 0 && (
                        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50 text-center">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Assimetria Coxas</p>
                          <p className={`text-lg font-black ${metrics.thighAsymmetry > 3 ? 'text-rose-400' : 'text-slate-300'}`}>{metrics.thighAsymmetry}%</p>
                        </div>
                      )}
                      {metrics.calfAsymmetry > 0 && (
                        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50 text-center">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Assimetria Panturrilha</p>
                          <p className={`text-lg font-black ${metrics.calfAsymmetry > 3 ? 'text-rose-400' : 'text-slate-300'}`}>{metrics.calfAsymmetry}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* Footer / Navigation */}
      <div className="sticky bottom-0 bg-[#050B14]/90 backdrop-blur-md p-4 sm:p-6 border-t border-slate-800/50 z-20 shrink-0">
        <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
          {step > 1 ? (
             <Button variant="ghost" onClick={() => setStep((step - 1) as any)} className="text-slate-400 hover:text-white shrink-0">
               <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
             </Button>
          ) : (
             <div />
          )}

          {step < 4 && (
            <Button onClick={() => setStep((step + 1) as any)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0 px-8 py-6 rounded-2xl font-bold uppercase tracking-widest">
              Avançar <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          )}

          {step === 4 && (
            <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 shrink-0 px-8 py-6 rounded-2xl font-bold uppercase tracking-widest">
              {isSaving ? "Salvando..." : "Finalizar Avaliação"} <Save className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );"""

start_str = "return ("

start_idx = code.find(start_str)

if start_idx != -1:
    new_code = code[:start_idx] + replacement + "\n}\n"
    with open('components/AnthropometricAssessmentForm.tsx', 'w') as f:
        f.write(new_code)
        print("Success")
else:
    print("Error")
