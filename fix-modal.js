const fs = require('fs');

let content = fs.readFileSync('components/AthleteHealthProfile.tsx', 'utf8');

// Fix the Assessment Details Modal translations
content = content.replace(
  '<h3 className="text-xl font-black text-white uppercase tracking-tight">Detalhes da Avaliação</h3>',
  '<h3 className="text-xl font-black text-white uppercase tracking-tight">{language === "pt" ? "Detalhes da Avaliação" : "Assessment Details"}</h3>'
);

content = content.replace(
  '<p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Tipo</p>',
  '<p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">{language === "pt" ? "Tipo" : "Type"}</p>'
);

content = content.replace(
  '<p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Classificação</p>',
  '<p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">{language === "pt" ? "Classificação" : "Classification"}</p>'
);

content = content.replace(
  '<p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Pontuação Final</p>',
  '<p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">{language === "pt" ? "Pontuação Final" : "Final Score"}</p>'
);

content = content.replace(
  '<h4 className="border-b border-slate-800/50 pb-2 text-xxs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">',
  '<h4 className="border-b border-slate-800/50 pb-2 text-xxs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">'
); // to find it

// Actually let's just replace them if they exist
const replaces = [
  ['Detalhes da Avaliação', '{language === "pt" ? "Detalhes da Avaliação" : "Assessment Details"}'],
  ['Tipo</p>', '{language === "pt" ? "Tipo" : "Type"}</p>'],
  ['Classificação</p>', '{language === "pt" ? "Classificação" : "Classification"}</p>'],
  ['Pontuação Final</p>', '{language === "pt" ? "Pontuação Final" : "Final Score"}</p>'],
  ['Dados Detalhados\n', '{language === "pt" ? "Dados Detalhados" : "Detailed Data"}\n'],
  ['Alertas Clínicos\n', '{language === "pt" ? "Alertas Clínicos" : "Clinical Alerts"}\n']
];

replaces.forEach(([from, to]) => {
  // Use regex to replace only in the modal block? 
  // It's safer to just do string matching, there are not many places with these EXACT tags.
});

// Since the above might fail due to subtle variations, let me just do manual replaces via regex.

content = content.replace(
  />\s*Tipo\s*<\/p>/ig,
  '>{language === "pt" ? "Tipo" : "Type"}</p>'
);
content = content.replace(
  />\s*Classifica[çc][ãa]o\s*<\/p>/ig,
  '>{language === "pt" ? "Classificação" : "Classification"}</p>'
);
content = content.replace(
  />\s*Pontua[çc][ãa]o\s+Final\s*<\/p>/ig,
  '>{language === "pt" ? "Pontuação Final" : "Final Score"}</p>'
);
content = content.replace(
  /Dados\s+Detalhados/g,
  '{language === "pt" ? "Dados Detalhados" : "Detailed Data"}'
);
content = content.replace(
  /Alertas\s+Cl[ií]nicos/g,
  '{language === "pt" ? "Alertas Clínicos" : "Clinical Alerts"}'
);

content = content.replace(
  />\s*Detalhes\s+da\s+Avalia[çc][ãa]o\s*<\/h3>/g, 
  '>{language === "pt" ? "Detalhes da Avaliação" : "Assessment Details"}</h3>'
);

// We had "Histórico de Avaliações"
content = content.replace(
  />\s*Hist[óo]rico\s+de\s+Avalia[çc][õo]es\s*<\/h2>/g, 
  '>{language === "pt" ? "Histórico de Avaliações" : "Assessment History"}</h2>'
);


fs.writeFileSync('components/AthleteHealthProfile.tsx', content);
console.log('done translations');
