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
  content = content.replace(/onSave\(/g, 'await onSave(');

  let handleSaveRegex = /(const handleSave = async \(\) => {\n    setIsSaving\(true\);\n    try \{[\s\S]*?)(\n  \};\n)/;
  content = content.replace(handleSaveRegex, '$1\n    } finally {\n      setIsSaving(false);\n    }$2');

  // 3. Search for the Save button and add disabled={isSaving}
  content = content.replace(/<Button\s+onClick=\{handleSave\}\s+className="/g, '<Button onClick={handleSave} disabled={isSaving} className="');
  content = content.replace(/<Button\s+className="([^"]+)"\s+onClick=\{handleSave\}/g, '<Button className="$1" onClick={handleSave} disabled={isSaving}');

  // 4. Change button content to show spinner
  content = content.replace(/<Save className="w-4 h-4 mr-2"(.*?)(\/>|>)/g, 
    '{isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2"$1$2}');
    
  content = content.replace(/<Save className="w-5 h-5 mr-2"(.*?)(\/>|>)/g, 
    '{isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2"$1$2}');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}
