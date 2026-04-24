const fs = require('fs');
let content = fs.readFileSync('./components/AthleteHealthProfile.tsx', 'utf8');

// 1. Update translateKey
content = content.replace('const translateKey = (key: string): string => {', 'const translateKey = (key: string, lang: string): string => {');
content = content.replace('if (dict[key]) return dict[key];', 'if (lang === "pt" && dict[key]) return dict[key];\n  if (lang === "en") {\n    const enDict: Record<string, string> = { \n      trainingLoad: "Training Load", rpe: "RPE", fatigue: "Fatigue", recovery: "Recovery", score: "Score", riskLevel: "Risk Level", date: "Date", notes: "Notes", classification: "Classification", alerts: "Alerts"\n    };\n    if (enDict[key]) return enDict[key];\n  }');

// 2. Update translateValue
content = content.replace('const translateValue = (value: any): string => {', 'const translateValue = (value: any, lang: string): string => {');
content = content.replace(`if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (value === null || value === undefined) return 'N/A';
  if (Array.isArray(value)) return value.map(translateValue).join(', ');`, 
`if (typeof value === 'boolean') return value ? (lang === 'pt' ? 'Sim' : 'Yes') : (lang === 'pt' ? 'Não' : 'No');
  if (value === null || value === undefined) return 'N/A';
  if (Array.isArray(value)) return value.map(v => translateValue(v, lang)).join(', ');`);

content = content.replace(`const dict: Record<string, string> = {`, `if (lang !== 'pt') return String(value).charAt(0).toUpperCase() + String(value).slice(1);\n    const dict: Record<string, string> = {`);

// 3. Update renderDataNode
content = content.replace('const renderDataNode = (key: string, value: any, depth = 0) => {', 'const renderDataNode = (key: string, value: any, lang: string, depth = 0): React.ReactNode => {');
content = content.replace('const translatedKey = translateKey(key);', 'const translatedKey = translateKey(key, lang);');
content = content.replace('      <span className="text-xs font-bold text-white text-right ml-4">\n        {translateValue(value)}\n      </span>', '      <span className="text-xs font-bold text-white text-right ml-4">\n        {translateValue(value, lang)}\n      </span>');
content = content.replace(/Object.entries\(value\).map\(\(\[subKey, subValue\]\) => renderDataNode\(subKey, subValue, depth \+ 1\)\)/g, 'Object.entries(value).map(([subKey, subValue]) => renderDataNode(subKey, subValue, lang, depth + 1))');

// 4. Update the renderDataNode caller
content = content.replace(/Object.entries\(selectedAssessment.raw_data \|\| selectedAssessment.data\).map\(\(\[key, value\]\) => renderDataNode\(key, value\)\)/g, 'Object.entries(selectedAssessment.raw_data || selectedAssessment.data).map(([key, value]) => renderDataNode(key, value, language))');

// 5. Check if it's correct
fs.writeFileSync('./components/AthleteHealthProfile.tsx', content);
console.log('done');
