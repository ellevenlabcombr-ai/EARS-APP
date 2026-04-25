const fs = require('fs');
['PosturalAnalysisTool.tsx', 'PosturalAssessmentModal.tsx', 'AthleteHealthProfile.tsx'].forEach(file => {
  const p = 'components/' + file;
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/\\\$/g, '$');
  content = content.replace(/\\`/g, '`');
  content = content.replace(/\\\\n/g, '\\n');
  content = content.replace(/\\\\/g, '\\');
  fs.writeFileSync(p, content);
});
console.log('Fixed escaped chars');
