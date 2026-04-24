const fs = require('fs');
const files = [
  './components/AnthropometricAssessmentForm.tsx',
  './components/DynamometryAssessment.tsx',
  './components/FunctionalScreening.tsx',
  './components/HydrationAssessmentForm.tsx',
  './components/MaturationAssessmentForm.tsx',
  './components/MenstrualAssessmentForm.tsx',
  './components/NeurologicalAssessment.tsx',
  './components/NutritionalAssessmentForm.tsx',
  './components/PainMap.tsx',
  './components/PhysicalAssessment.tsx',
  './components/PsychologicalAssessment.tsx',
  './components/RedSAssessmentForm.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('const [isSaving, setIsSaving]')) {
    console.log(`Skipping ${file} - already has isSaving`);
    continue;
  }

  // 1. Add isSaving state before handleSave
  content = content.replace('const handleSave = () => {', 
    'const [isSaving, setIsSaving] = useState(false);\n\n  const handleSave = async () => {\n    setIsSaving(true);\n    try {');

  // 2. Wrap the inside of handleSave with try/finally to set isSaving(false)
  // We need to find the end of handleSave.
  // We know it ends with `  };` or `};` and the next thing is usually something else.
  // Since we replaced the start, we can find `\n  };\n` after the new handleSave.
  
  // Actually, we can just replace `onSave(` with `await onSave(`. Wait, if there are multiple?
  content = content.replace(/onSave\(/g, 'await onSave(');

  // Now we need to close the try block at the end of handleSave.
  // Instead of parsing AST, let's just use regex to replace the first `  };\n` that comes after handleSave.
  // Or we can manually insert `} finally { setIsSaving(false); }` before the `};` of handleSave.
  let handleSaveRegex = /(const handleSave = async \(\) => {\n    setIsSaving\(true\);\n    try \{[\s\S]*?)(\n  \};\n)/;
  content = content.replace(handleSaveRegex, '$1\n    } finally {\n      setIsSaving(false);\n    }$2');

  // 3. Search for the Save button and add disabled={isSaving}
  content = content.replace(/<Button\s+onClick=\{handleSave\}\s+className="/g, '<Button onClick={handleSave} disabled={isSaving} className="');
  content = content.replace(/<Button\s+className="([^"]+)"\s+onClick=\{handleSave\}/g, '<Button className="$1" onClick={handleSave} disabled={isSaving}');

  // 4. Change button content to show spinner
  // They usually have: <Save className="w-4 h-4 mr-2" /> Salvar Avaliação
  // We can change `<Save` to `{isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />}{!isSaving && <Save`
  // Actually, easier: 
  content = content.replace(/<Save className="w-4 h-4 mr-2"(.*?)(\/>|>)/g, 
    '{isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2"$1$2}');
    
  content = content.replace(/<Save className="w-5 h-5 mr-2"(.*?)(\/>|>)/g, 
    '{isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2"$1$2}');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}
