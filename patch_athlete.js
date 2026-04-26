const fs = require('fs');
let code = fs.readFileSync('components/AthleteHealthProfile.tsx', 'utf8');

const startIdx = code.indexOf('{/* 1. Cinematic Hero Header */}');
const endMarker = '<main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-10">';
const endIdx = code.indexOf(endMarker) + endMarker.length;

if (startIdx === -1 || Number.isNaN(endIdx)) {
    console.log("Could not find markers.");
    process.exit(1);
}

const replacement = `      {/* Top App Bar */}
      <div className="px-6 py-5 border-b border-slate-800/50 flex justify-between items-center bg-[#0A1120] sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-4">
           {athletePhoto ? (
             <img src={athletePhoto} alt={athlete.name} className="w-12 h-12 rounded-xl object-cover border-2 border-slate-700" />
           ) : (
             <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border-2 border-slate-700"><User className="w-6 h-6 text-slate-500" /></div>
           )}
           <div className="flex flex-col">
             <h1 className="text-xl font-black text-white uppercase tracking-tight">{athlete.name}</h1>
             <div className="flex items-center gap-2">
                 <p className="text-xxs text-slate-400 uppercase font-bold tracking-widest">{athlete.category || 'Atleta'} {athlete.position ? \`• \${athlete.position}\` : ''}</p>
                 {athlete.athlete_code && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 uppercase font-black tracking-widest">#{athlete.athlete_code}</span>
                 )}
             </div>
           </div>
        </div>
        <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white uppercase text-xxs font-black tracking-widest"><ChevronLeft className="w-4 h-4 mr-2" /> Voltar</Button>
      </div>

      <div className="max-w-6xl mx-auto w-full px-6 pt-10 pb-4 overflow-x-auto custom-scrollbar">
        {/* Progress Steps / Tabs */}
        <div className="flex items-center justify-between min-w-[600px] mb-8">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Activity },
            { id: 'ficha', label: 'Cadastro', icon: User },
            { id: 'clinical', label: 'Avaliações', icon: Stethoscope },
            { id: 'prontuario', label: 'Prontuário', icon: FileText },
            { id: 'attachments', label: 'Anexos', icon: ClipboardList },
            { id: 'history', label: 'Histórico', icon: Clock },
          ].map((tab, i, arr) => {
            const activeIndex = arr.findIndex(t => t.id === activeTab);
            const isPast = activeIndex > i;
            const isActive = activeIndex === i;
            
            return (
            <React.Fragment key={tab.id}>
              <div 
                className={\`flex flex-col items-center gap-3 cursor-pointer transition-all \${isActive ? 'scale-110' : 'opacity-60 hover:opacity-100'}\`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <div className={\`w-14 h-14 rounded-full flex items-center justify-center border-[3px] \${isActive ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-slate-700 bg-slate-900/50 text-slate-400'}\`}>
                  <tab.icon className="w-6 h-6" />
                </div>
                <span className={\`text-[0.65rem] font-black uppercase tracking-widest text-center max-w-[6rem] leading-tight \${isActive ? 'text-cyan-400' : 'text-slate-500'}\`}>{tab.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className={\`flex-1 h-[3px] mx-4 mb-8 rounded-full \${activeIndex > i ? 'bg-cyan-500/50' : 'bg-slate-800'}\`}></div>
              )}
            </React.Fragment>
          )})}
        </div>
      </div>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-10">`;

code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
fs.writeFileSync('components/AthleteHealthProfile.tsx', code);
console.log("Successfully replaced Cinematic Header with Top App Bar and Progress Tabs.");
