const fs = require('fs');
let content = fs.readFileSync('/app/applet/components/AthleteHealthProfile.tsx', 'utf8');

// 1. Update translateKey
content = content.replace('const translateKey = (key: string): string => {', 'const translateKey = (key: string, lang: string): string => {');
content = content.replace('if (dict[key]) return dict[key];', 'if (lang === "pt" && dict[key]) return dict[key];\n  if (lang === "en") {\n    const enDict: Record<string, string> = { \n      trainingLoad: "Training Load", rpe: "RPE", fatigue: "Fatigue", recovery: "Recovery", score: "Score", riskLevel: "Risk Level", date: "Date", notes: "Notes", classification: "Classification", alerts: "Alerts", skinfolds: "Skinfolds", measurements: "Measurements", chest: "Chest", thigh: "Thigh", abdomen: "Abdomen", triceps: "Triceps", axillary: "Axillary", suprailiac: "Suprailiac", subscapular: "Subscapular", hip: "Hip", neck: "Neck", waist: "Waist", \"LEFT CALF\": "Left Calf", \"LEFT THIGH\": "Left Thigh", \"RIGHT CALF\": "Right Calf", \"RIGHT THIGH\": "Right Thigh", \"LEFT FOREARM\": "Left Forearm", \"RIGHT FOREARM\": "Right Forearm", shoulders: "Shoulders"\n    };\n    if (enDict[key]) return enDict[key];\n  }');

// 2. Update translateValue
content = content.replace('const translateValue = (value: any): string => {', 'const translateValue = (value: any, lang: string): string => {');
content = content.replace(`if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (value === null || value === undefined) return 'N/A';
  if (Array.isArray(value)) return value.map(translateValue).join(', ');`, 
`if (typeof value === 'boolean') return value ? (lang === 'pt' ? 'Sim' : 'Yes') : (lang === 'pt' ? 'Não' : 'No');
  if (value === null || value === undefined) return 'N/A';
  if (Array.isArray(value)) return value.map(v => translateValue(v, lang)).join(', ');`);

// 3. Update renderDataNode
content = content.replace('const renderDataNode = (key: string, value: any, depth = 0) => {', 'const renderDataNode = (key: string, value: any, lang: string, depth = 0): React.ReactNode => {');
content = content.replace('const translatedKey = translateKey(key);', 'const translatedKey = translateKey(key, lang);');
content = content.replace('      <span className="text-xs font-bold text-white text-right ml-4">\n        {translateValue(value)}\n      </span>', '      <span className="text-xs font-bold text-white text-right ml-4">\n        {translateValue(value, lang)}\n      </span>');
content = content.replace(/Object.entries\(value\).map\(\(\[subKey, subValue\]\) => renderDataNode\(subKey, subValue, depth \+ 1\)\)/g, 'Object.entries(value).map(([subKey, subValue]) => renderDataNode(subKey, subValue, lang, depth + 1))');

// 4. Update the renderDataNode caller
content = content.replace(/Object.entries\(selectedAssessment.raw_data \|\| selectedAssessment.data\).map\(\(\[key, value\]\) => renderDataNode\(key, value\)\)/g, 'Object.entries(selectedAssessment.raw_data || selectedAssessment.data).map(([key, value]) => renderDataNode(key, value, language))');

// 5. Update prompt to remove (IA)
content = content.replace('Relatório Clínico (IA)', '{language === "pt" ? "Relatório Clínico" : "Clinical Report"}');

// 6. Fix "DETALHES DA AVALIAÇÃO" etc
content = content.replace('DETALHES DA AVALIAÇÃO', '{language === "pt" ? "Detalhes da Avaliação" : "Assessment Details"}');
content = content.replace('TIPO</p>', '{language === "pt" ? "Tipo" : "Type"}</p>');
content = content.replace('CLASSIFICAÇÃO</p>', '{language === "pt" ? "Classificação" : "Classification"}</p>');
content = content.replace('PONTUAÇÃO FINAL</p>', '{language === "pt" ? "Pontuação Final" : "Final Score"}</p>');
content = content.replace('DADOS DETALHADOS', '{language === "pt" ? "Dados Detalhados" : "Detailed Data"}');
content = content.replace('ALERTAS CLÍNICOS', '{language === "pt" ? "Alertas Clínicos" : "Clinical Alerts"}');

fs.writeFileSync('/app/applet/components/AthleteHealthProfile.tsx', content);
console.log('done');
